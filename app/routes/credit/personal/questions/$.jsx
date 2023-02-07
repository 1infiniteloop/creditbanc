import CreditNav from "~/components/CreditNav";
import CreditHeroGradient from "~/components/CreditHeroGradient";
import { map, addIndex } from "ramda";

let mapIndexed = addIndex(map);

const questions = {
	authToken: "7327BCCA-6A1A-40DA-B628-1DB57329BD80",
	provider: "efx",
	questions: [
		{
			id: "1",
			text: "Your credit file indicates you may have a retail card, opened in or around January 2021. Who is the credit provider for this account?",
			answers: [
				{
					id: "1",
					text: "BOB'S DISC FURN",
					correctAnswer: "false",
				},
				{
					id: "2",
					text: "GECRB/ROOMS TO GO",
					correctAnswer: "false",
				},
				{
					id: "3",
					text: "JEWELERY ACCENT",
					correctAnswer: "false",
				},
				{
					id: "4",
					text: "LANE GALLERY",
					correctAnswer: "false",
				},
				{
					id: "5",
					text: "NONE OF THE ABOVE",
					correctAnswer: "false",
				},
			],
		},
		{
			id: "2",
			text: "Your credit file indicates you may have an auto loan/lease, opened in or around November 2022. Who is the credit provider for this account?",
			answers: [
				{
					id: "1",
					text: "CITIZENS INC.",
					correctAnswer: "false",
				},
				{
					id: "2",
					text: "PAB BANKSHARES INC",
					correctAnswer: "false",
				},
				{
					id: "3",
					text: "RIGGS NATIONAL",
					correctAnswer: "false",
				},
				{
					id: "4",
					text: "YORK FEDERAL SAVINGS & LOAN",
					correctAnswer: "false",
				},
				{
					id: "5",
					text: "NONE OF THE ABOVE",
					correctAnswer: "false",
				},
			],
		},
		{
			id: "3",
			text: "What is the total monthly payment for the above-referenced account?",
			answers: [
				{
					id: "1",
					text: "$1,475 - $1,524",
					correctAnswer: "false",
				},
				{
					id: "2",
					text: "$1,525 - $1,574",
					correctAnswer: "false",
				},
				{
					id: "3",
					text: "$1,575 - $1,624",
					correctAnswer: "false",
				},
				{
					id: "4",
					text: "$1,625 - $1,674",
					correctAnswer: "false",
				},
				{
					id: "5",
					text: "NONE OF THE ABOVE",
					correctAnswer: "false",
				},
			],
		},
	],
};

const Form = () => {
	return (
		<form className="space-y-8">
			<div className="flex flex-col">
				{mapIndexed(
					(question, questionIndex) => (
						<fieldset
							className="flex flex-col my-3"
							key={questionIndex}
						>
							<div className="flex flex-row w-full">
								<div className="bg-gray-200 w-[21px] h-[20px] flex flex-col rounded-full mr-[10px] mt-[5px] items-center justify-center text-xs text-gray-500">
									{questionIndex + 1}
								</div>
								<div className="text-base text-black flex flex-col w-full">
									{question.text}
								</div>
							</div>
							<div className="mt-4 space-y-4 px-7">
								{mapIndexed(
									(answer, answerIndex) => (
										<div
											className="flex items-center"
											key={answerIndex}
										>
											<input
												id={questionIndex}
												name={questionIndex}
												type="radio"
												className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
											/>
											<label
												htmlFor={questionIndex}
												className="ml-3 block text-sm text-gray-700"
											>
												{answer.text}
											</label>
										</div>
									),
									question.answers
								)}
							</div>
						</fieldset>
					),
					questions.questions
				)}
			</div>
			<div className="flex flex-row w-full justify-end pt-2">
				<button
					type="button"
					className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				>
					Next
				</button>
			</div>
		</form>
	);
};

const Heading = () => {
	return (
		<div className="bg-transparent">
			<div className="mx-auto max-w-7xl py-4 pb-6 px-2">
				<div className="text-center">
					<p className="mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
						Verification questions
					</p>
				</div>
			</div>
		</div>
	);
};

export default function PersonalCreditReportQuestions() {
	return (
		<div className="flex flex-col w-full">
			<CreditNav />
			<CreditHeroGradient />
			<div className="flex flex-col w-full p-[20px] max-w-2xl mx-auto">
				<Heading />
				<Form />
			</div>
		</div>
	);
}