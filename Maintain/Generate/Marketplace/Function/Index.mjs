import { parseMarketIndex } from "@deepseek-ai/dsh-plugin-market-index";

const Titles = {
	plugin: "Plugin",
	hook: "Hook",
	client: "Client",
	library: "Library",
};
const LabelTitles = {
	classic: "Classic",
	effectts: "Effect-TS",
	npm: "npm",
	source: "Source",
};

export default (Plugins) => {
	const Index = {
		format: 1,
		title: { en: "DSH Family @ PlayForm" },
		description: {
			en: `The PlayForm DeepSeek Harness plugin family: ${Plugins.length} packages across the Classic TypeScript and Effect-TS trees.`,
		},
		metadata: {
			categories: Object.fromEntries(
				Object.entries(Titles).map(([Id, Title]) => [Id, { title: { en: Title } }]),
			),
			labels: Object.fromEntries(
				Object.entries(LabelTitles).map(([Id, Title]) => [Id, { title: { en: Title } }]),
			),
			sortKeys: {},
		},
		plugins: Plugins.sort((A, B) => A.name.localeCompare(B.name)),
	};

	parseMarketIndex(Index, "https://deepseek.playform.cloud/marketplace.json");

	return Index;
};
