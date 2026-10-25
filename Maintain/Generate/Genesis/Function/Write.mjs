import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { renderGenesis } from "../../../Icon/Genesis.mjs";
import { genomeOf, packages } from "../../../Icon/Index.mjs";

export default (Root) => {
	const Output = join(Root, "Temporary", "Genesis");
	mkdirSync(Output, { recursive: true });
	const Names = [];
	for (const Genome of packages(Root).map((Entry) => genomeOf(Root, Entry))) {
		const Name = `${Genome.dir}.svg`;
		writeFileSync(join(Output, Name), renderGenesis(Genome));
		Names.push(Name);
	}
	console.log(`genesis: ${Names.length} icons -> ${Output}`);
	return { Output, Names };
};
