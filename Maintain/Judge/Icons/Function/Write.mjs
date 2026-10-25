import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export default (Root, { Ranked, Chosen }) => {
	mkdirSync(join(Root, "Temporary"), { recursive: true });
	writeFileSync(
		join(Root, "Temporary", "Judgement.json"),
		`${JSON.stringify({ ranked: Ranked, chosen: Chosen.map((Entry) => Entry.dir) }, null, "\t")}\n`,
	);
};
