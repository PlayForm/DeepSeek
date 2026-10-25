// Genesis.mjs - the degenerative renderer.
//
// The scene is the residue returned by Decay.mjs: a plate, a decayed seed
// shape with cracks and holes, debris fragments, and a core. Every part is a
// solid path; a white gap stroke separates the planes.

import { pathOf } from "./Curve.mjs";
import { decayOf } from "./Decay.mjs";
import { palettesOf } from "./Palette.mjs";

const PaintOf = (Tone, Palette) => {
	switch (Tone) {
		case "accent":
			return Palette.accent;
		case "accent2":
			return Palette.accent2;
		case "tint":
			return Palette.tint;
		default:
			return Palette.ink;
	}
};

const pathOfPart = (Part) => {
	const Body = pathOf(Part.points, true);
	const Cutouts = (Part.cutout ?? []).map((Polygon) => pathOf(Polygon, true)).join(" ");
	return Cutouts === "" ? Body : `${Body} ${Cutouts}`;
};

const escape = (Text) =>
	Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const renderGenesis = (Genome) => {
	const Residue = decayOf(Genome.profile ?? {}, Genome.seed);
	const Palette = palettesOf(Genome);
	const Parts = [Residue.plate, ...Residue.fragments, Residue.shape, Residue.core].sort(
		(A, B) => A.depth - B.depth,
	);
	const Label = `${Genome.package} - decay ${Residue.seed.sides}/${Residue.seed.rounds}`;
	const Body = Parts.map(
		(Part) =>
			`\t<path d="${pathOfPart(Part)}" fill="${PaintOf(Part.tone, Palette)}" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" paint-order="stroke fill"/>`,
	).join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(Label)}">
	<title>${escape(Label)}</title>
${Body}
</svg>
`;
};

export const residueOf = (Genome) => decayOf(Genome.profile ?? {}, Genome.seed);
