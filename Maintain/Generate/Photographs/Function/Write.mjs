import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { effectOf } from "../../../Icon/Function.mjs";
import { genomeOf, packages } from "../../../Icon/Index.mjs";
import { palettesOf } from "../../../Icon/Palette.mjs";
import { photographOf } from "../../../Icon/Photograph.mjs";

const Rgb = (Hex) => {
	const Clean = String(Hex).replace("#", "");
	return [0, 2, 4].map((Index) => Number.parseInt(Clean.slice(Index, Index + 2), 16));
};
const Hex = (Rgb) =>
	`#${Rgb.map((Value) =>
		Math.max(0, Math.min(255, Math.round(Value)))
			.toString(16)
			.padStart(2, "0"),
	).join("")}`;
const Mix = (From, To, Ratio) => {
	const A = Rgb(From);
	const B = Rgb(To);
	return Hex(A.map((Value, Index) => Value + (B[Index] - Value) * Ratio));
};

const TonesOf = (Palette) => ({
	deep: Mix(Palette.ink, "#000000", 0.35),
	ink: Palette.ink,
	ink2: Mix(Palette.ink, Palette.accent2, 0.45),
	state: Mix(Palette.ink, Palette.accent, 0.25),
	events: Palette.accent,
	tools: Palette.accent2,
	injections: Mix(Palette.accent2, Palette.accent, 0.5),
	feature: Mix(Palette.tint, Palette.accent, 0.55),
	accent: Palette.accent,
	accent2: Palette.accent2,
	accent3: Mix(Palette.accent2, Palette.accent, 0.5),
	tint: Palette.tint,
});

const Circle = (Dot) =>
	`M${Dot.x - Dot.r},${Dot.y} A${Dot.r},${Dot.r} 0 1,0 ${Dot.x + Dot.r},${Dot.y} A${Dot.r},${Dot.r} 0 1,0 ${Dot.x - Dot.r},${Dot.y} Z`;

export default (Root) => {
	const Output = join(Root, "Temporary", "Photographs");
	mkdirSync(Output, { recursive: true });
	const Names = [];
	for (const Genome of packages(Root).map((Entry) => genomeOf(Root, Entry))) {
		const { dots } = photographOf(
			Genome.profile ?? {},
			(Genome.manifest ?? { tokens: {} }).tokens ?? {},
			effectOf(Genome.domain, Genome.dir),
			Genome.seed,
		);
		const Tones = TonesOf(palettesOf(Genome));
		const Groups = new Map();
		for (const Dot of dots) {
			if (!Groups.has(Dot.tone)) {
				Groups.set(Dot.tone, []);
			}
			Groups.get(Dot.tone).push(Circle(Dot));
		}
		const Body = [...Groups.entries()]
			.map(
				([Tone, Paths]) =>
					`\t<path d="${Paths.join(" ")}" fill="${Tones[Tone] ?? Tones.ink}" fill-rule="evenodd" stroke="none"/>`,
			)
			.join("\n");
		const Name = `${Genome.dir}.svg`;
		writeFileSync(
			join(Output, Name),
			`<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${Genome.package}">\n\t<title>${Genome.package}</title>\n${Body}\n</svg>\n`,
		);
		Names.push(Name);
	}
	console.log(`photographs: ${Names.length} -> ${Output}`);
	return { Output, Names };
};
