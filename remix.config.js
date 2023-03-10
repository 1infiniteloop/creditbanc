const { flatRoutes } = require("remix-flat-routes");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*"],
	routes: async (defineRoutes) => {
		return flatRoutes("routes", defineRoutes, {
			paramPrefixChar: ":",
		});
	},
	appDirectory: "app",
	assetsBuildDirectory: "public/build",
	serverBuildPath: "build/index.js",
	publicPath: "/build/",
};
