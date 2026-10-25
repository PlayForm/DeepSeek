// RenderScene.mjs - the transliterated scene to SVG.
//
// Components stay separate through validation (the scene is the source of truth
// and the ledger records it); at export they are merged BY TONE into one path per
// tone, which is the optimisation the brief allows AFTER the checks. Cutouts are
// appended to their component's path as even-odd subpaths, so a wedge cut really
// removes area rather than painting the background over it.

import { buildComponent } from "./Component.mjs";
import { pathOf } from "./Curve.mjs";
import { palettesOf } from "./Palette.mjs";
import { sceneOf } from "./Transliterate.mjs";

const TONES = ["ink", "accent", "accent2"];

const sceneFor = (Genome, Plan) => {
	const Scene = sceneOf(Genome, Plan, Genome.manifest ?? { tokens: {} });
	return Scene.components.map((Component) => ({ ...buildComponent(Component), fill: Component.fill }));
};

const label = (Genome, Plan) => `${Genome.package} - ${Plan.grammar}`;

const escape = (Text) => Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const documentOf = ({ Genome, Plan, Palette, Mono }) => {
	const Built = sceneFor(Genome, Plan);
	const Prefix = String(Genome.dir).replace(/[^a-z0-9-]/gi, "-");
	const Paints = [Mono ? "currentColor" : Palette.ink, Mono ? "currentColor" : Palette.accent, Mono ? "currentColor" : Palette.accent2];
	const Paths = [[], [], []];
	const Fills = [];
	for (const Component of Built) {
		const Index = Math.max(0, TONES.indexOf(Component.material.tone));
		const Cutouts = (Component.cutout ?? []).map((Polygon) => pathOf(Polygon, true)).join(" ");
		const Path = Cutouts === "" ? Component.envelope : `${Component.envelope} ${Cutouts}`;
		Paths[Index].push(Path);
		if (Component.fill === "tint" || Component.fill === "solid") {
			Fills.push({ path: Path, fill: Component.fill });
		}
	}
	const Defs = Paths.map((Group, Index) => (Group.length === 0 ? "" : `\t\t<path id="${Prefix}-${TONES[Index]}" d="${Group.join(" ")}"/>`)).join("\n");
	const FillPass = Fills.map((Fill) => {
		const Paint = Fill.fill === "tint" ? (Palette?.tint ?? "currentColor") : Mono ? "currentColor" : Palette.accent;
		const Opacity = Fill.fill === "tint" ? (Mono ? "0.10" : "0.85") : Mono ? "0.18" : "0.95";
		return `\t<path d="${Fill.path}" fill="${Paint}" fill-opacity="${Opacity}" fill-rule="evenodd" stroke="none"/>`;
	}).join("\n");
	const ContourPass = Paths.map((Group, Index) =>
		Group.length === 0
			? ""
			: `\t<g fill="none" stroke="${Paints[Index]}" stroke-width="1.4" stroke-opacity="${Mono ? 0.25 : 0.30}" stroke-linejoin="round">\n\t\t<use href="#${Prefix}-${TONES[Index]}"/>\n\t</g>`,
	).join("\n");
	const BodyPass = Paths.map((Group, Index) =>
		Group.length === 0
			? ""
			: `\t<g fill="${Paints[Index]}"${Index === 0 ? "" : Mono ? ' fill-opacity="0.6"' : ""} fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-${TONES[Index]}"/>\n\t</g>`,
	).join("\n");
	const Trace =
		Plan.mode === "traced"
			? `\n\t<g transform="translate(1.2,-1.2)" fill="${Paints[0]}" fill-opacity="0.18" fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-ink"/>\n\t</g>`
			: "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
	<defs>
${Defs}
	</defs>
${FillPass}
${ContourPass}
${BodyPass}${Trace}
</svg>
`;
};

/** The mono document: no hue, currentColor only. */
export const renderMono = (Genome, Plan) => documentOf({ Genome, Plan, Palette: null, Mono: true });

/** The colour document: the per-package palette, the marketplace asset. */
export const renderColour = (Genome, Plan) => documentOf({ Genome, Plan, Palette: palettesOf(Genome), Mono: false });

/** The scene of one package, for the ledger and the checks. */
export const sceneOfPackage = (Genome, Plan) => sceneFor(Genome, Plan);
