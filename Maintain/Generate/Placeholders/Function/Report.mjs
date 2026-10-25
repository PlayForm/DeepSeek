import Trees from "../../../Common/Variable/Trees.mjs";
import Tiers from "../Variable/Tiers.mjs";

export default (Rows) => {
	console.log(`${Rows.length} package(s) across ${Trees.join(" + ")}.\n`);
	for (const Tier of Tiers) {
		const Members = Rows.filter((Row) => Row.Tier === Tier);
		console.log(`${Tier} (${Members.length})`);
		if (Tier !== "1-missing") continue;
		for (const Row of Members) {
			console.log(`  ${Row.Name}  [${Row.Tree}]  repo=${Row.Version}  latest=${Row.Latest}`);
		}
	}
};
