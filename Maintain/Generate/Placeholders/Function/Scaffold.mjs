import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import Output from "../Variable/Output.mjs";
import Tiers from "../Variable/Tiers.mjs";

const LegacyTiers = ["2-planned", "3-candidates"];
const PlaceholderVersion = "0.0.0";
const Description =
	"Placeholder publication (the real package ships from github.com/PlayForm/DeepSeek).";

export default (Rows) => {
	for (const Tier of [...Tiers, ...LegacyTiers]) {
		rmSync(join(Output, Tier), { recursive: true, force: true });
	}
	const Missing = Rows.filter((Row) => Row.Tier === "1-missing");
	for (const Row of Missing) {
		const Directory = join(Output, "1-missing", Row.Directory);
		mkdirSync(Directory, { recursive: true });
		writeFileSync(
			join(Directory, "package.json"),
			`${JSON.stringify(
				{
					name: Row.Name,
					version: PlaceholderVersion,
					description: Description,
					license: "CC0-1.0",
					repository: {
						type: "git",
						url: "git+https://github.com/PlayForm/DeepSeek.git",
					},
					publishConfig: { access: "public" },
				},
				null,
				"\t",
			)}\n`,
		);
	}
	return Missing.length;
};
