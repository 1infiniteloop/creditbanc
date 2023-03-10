import { json, createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "./prisma.server";
import bcrypt from "bcryptjs";
import { create as create_user } from "./entity.server";
import { create as create_roles } from "./role.server";
import { create_root } from "./group.server";
import { take } from "ramda";

let secret = process.env.SESSION_SECRET;

if (!secret) {
	throw new Error("Please set the SESSION_SECRET environment variable");
}

const storage = createCookieSessionStorage({
	cookie: {
		name: "creditbanc_session",
		secure: process.env.NODE_ENV === "production",
		secret: [secret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

export const signup = async (form) => {
	const exists = await prisma.entity.count({ where: { email: form.email } });

	if (exists) {
		return json(
			{
				error: "User already exists",
			},
			{ status: 400 }
		);
	}

	const entity = await create_user(form);

	if (!entity) {
		return json(
			{
				error: `Something wen't wrong when creating the new account.`,
				fields: { email: form.email, password: form.password },
			},
			{ status: 400 }
		);
	}

	let { group, resource } = await create_root({
		user_id: entity.id,
		name: "root",
	});

	console.log("resource", resource);

	let permissions = {
		[resource.resource_path_id]: {
			"@alpha": {
				can_view: true,
			},
		},
	};

	let resource_roles = await create_roles({
		resource_ids: { set: resource.id },
		entity_ids: { set: entity.id },
		type: "resource",
		permissions,
	});

	// let creator_resource_role = await create_role({
	// 	resource_ids: { set: resource.id },
	// 	entity_ids: { set: entity.id },
	// 	type: "resource",
	// 	name: "root",
	// 	link: {
	// 		create: {
	// 			hash: Buffer.from(`${resource.id}${Date.now()}`).toString(
	// 				"base64"
	// 			),
	// 		},
	// 	},
	// 	settings: {
	// 		create: {
	// 			can_view: true,
	// 		},
	// 	},
	// });

	let entity_permissions = ["@alpha"];

	let creator_user_role = await create_roles({
		resource_ids: { set: resource.id },
		entity_ids: { set: entity.id },
		type: "entity",
		permissions: entity_permissions,
		// name: "@alpha",
	});

	// let default_user_role = await create_roles({
	// 	resource_id: resource.id,
	// 	entity_ids: { set: entity.id },
	// 	type: "entity",
	// 	name: "@default",
	// });

	await prisma.resource.update({
		where: { id: resource.id },
		data: {
			roles_ids: resource_roles.id,
			// role_ids: {
			// 	push: [creator_resource_role.id, default_resource_role.id],
			// },
			subscription_ids: {
				push: [resource.id],
			},
			subscriber_ids: {
				push: [resource.id],
			},
		},
	});

	await prisma.entity.update({
		where: { id: entity.id },
		data: {
			roles_ids: { push: [creator_user_role.id] },
			root_resource_id: resource.id,
		},
	});

	return create_user_session(entity.id, "/");
};

export const signin = async (form) => {
	let { email, password } = form;

	const user = await prisma.entity.findFirst({
		where: { email },
	});

	let root_group = await prisma.resource.findFirst({
		where: {
			resource_path_id: user.root_group_resource_path_id,
		},
		include: {
			subscriptions: {
				where: {
					type: "file",
				},
				take: 1,
			},
		},
	});

	let file = root_group.subscriptions[0];

	let file_map = {
		personal_credit_report: "personal",
		business_credit_report: "business",
	};

	let redirect_url = `/credit/${
		file_map[file.model]
	}/report/personal/resource/e/${user.id}/g/${
		root_group.resource_path_id
	}/f/${file.resource_path_id}`;

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return json(
			{
				error: "Incorrect login",
			},
			{ status: 400 }
		);
	}

	return create_user_session(user.id, redirect_url);
};

const create_user_session = async (entity_id, redirect_to) => {
	const session = await storage.getSession();
	session.set("entity_id", entity_id);
	return redirect(redirect_to, {
		headers: { "Set-Cookie": await storage.commitSession(session) },
	});
};

export const get_user_session = (request) => {
	return storage.getSession(request.headers.get("Cookie"));
};

export const require_user_session = async (
	request,
	redirect_to = new URL(request.url).pathname
) => {
	const session = await get_user_session(request);
	const entity_id = session.get("entity_id");

	if (!entity_id) {
		const search_params = new URLSearchParams([
			["redirect_to", redirect_to],
		]);
		throw redirect(`/signin?${search_params.toString()}`);
	}

	return entity_id;
};

export const get_user_id = async (request) => {
	const session = await get_user_session(request);
	const user_id = session.get("entity_id");

	if (!user_id || typeof user_id !== "string") {
		return null;
	}

	return user_id;
};

export const get_user = async (request) => {
	const user_id = await get_user_id(request);

	if (typeof user_id !== "string") {
		return null;
	}

	try {
		const user = await prisma.entity.findUnique({
			where: { id: user_id },
			select: { id: true, email: true },
		});
		return user;
	} catch {
		throw logout(request);
	}
};

export const logout = async (redirect_to, request) => {
	const session = await get_user_session(request);

	return redirect(redirect_to, {
		headers: { "Set-Cookie": await storage.destroySession(session) },
	});
};
