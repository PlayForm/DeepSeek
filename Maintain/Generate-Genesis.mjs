#!/usr/bin/env node
//===============================================================================
// Generate-Genesis.mjs - the degenerative icon set, built from scratch.
//===============================================================================
//
// This is a parallel, experimental generator: it ignores the motif library and
// the atlas entirely. Each icon is the residue of a decayed seed polygon, and
// the decay schedule comes from the package's inferred profile.
//
// Output: Temporary/Genesis/<dir>.svg and Temporary/Genesis-Sheet.png.
//
// Usage: node Maintain/Generate-Genesis.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { renderGenesis } from "./Icon/Genesis.mjs";
import { genomeOf, packages } from "./Icon/Index.mjs";

const Root = fileURLToPath(new URL("../", import.meta.url));
const Output = join(Root, "Temporary", "Genesis");
mkdirSync(Output, { recursive: true });

const Genomes = packages(Root).map((Entry) => genomeOf(Root, Entry));
const Names = [];
for (const Genome of Genomes) {
	const Name = `${Genome.dir}.svg`;
	writeFileSync(join(Output, Name), renderGenesis(Genome));
	Names.push(Name);
}
console.log(`genesis: ${Names.length} icons -> ${Output}`);

const Cell = 96;
const Columns = 17;
const Rows = Math.ceil(Names.length / Columns);
const Tiles = [];
for (const [Index, Name] of Names.entries()) {
	const Png = await sharp(join(Output, Name), { density: 300 })
		.resize(Cell - 8, Cell - 8, { fit: "contain", background: "#ffffff" })
		.png()
		.toBuffer();
	Tiles.push({
		input: Png,
		left: (Index % Columns) * Cell + 4,
		top: Math.floor(Index / Columns) * Cell + 4,
	});
}
await sharp({
	create: { width: Columns * Cell, height: Rows * Cell, channels: 3, background: "#ffffff" },
})
	.composite(Tiles)
	.png()
	.toFile(join(Root, "Temporary", "Genesis-Sheet.png"));
console.log(`genesis sheet: ${Columns * Cell}x${Rows * Cell}`);
