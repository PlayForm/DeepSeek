// Render.mjs - the collage to SVG step (ICON-GRAMMAR.md section 9).
//
// Every part is rendered from its CENTERLINE through the stroke-envelope
// pipeline (Envelope.mjs): the envelope is the area the stroke occupies, drawn
// as a fill; the contour is the envelope grown by a hairline, drawn under it.
// That is the correction the reference brief makes - a stroke is not two
// concentric SVG strokes, it is an outline around an envelope. Open centerlines
// keep their terminals: the envelope closes, the motif does not.
//
// The mono document carries no hue (fill="currentColor") so the site inlines it
// and it flips with the dark theme; the colour document carries the per-package
// palette and is the marketplace asset.

import { collageOf } from "./Compose.mjs";
import { envelopeOf } from "./Envelope.mjs";
import { palettesOf } from "./Palette.mjs";

const TONES = { ink: 0, accent: 1, accent2: 2 };
const NAMES = ["i", "a", "b"];

const grouped = (Parts) => {
	const Seen = new Set();
	const Groups = [[], [], []];
	const Fills = [];
	for (const Part of Parts) {
		if (Part.d.trim() === "" || Seen.has(Part.d)) {
			continue;
		}
		Seen.add(Part.d);
		Groups[TONES[Part.tone] ?? 0].push(Part);
		if (Part.fill !== undefined) {
			Fills.push(Part);
		}
	}
	return { Groups, Fills };
};

const label = (Genome, Plan) => `${Genome.package} - ${Plan.grammar}`;

const escape = (Text) =>
	Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const HAIRLINE = 0.7;

const documentOf = ({ Genome, Plan, Palette, Mono }) => {
	const { Groups, Fills } = grouped(collageOf(Genome, Plan));
	const Prefix = String(Genome.dir).replace(/[^a-z0-9-]/gi, "-");
	const Body = Plan.stroke.weight;
	const InkPaint = Mono ? "currentColor" : Palette.ink;
	const AccentPaint = Mono ? "currentColor" : Palette.accent;
	const Accent2Paint = Mono ? "currentColor" : Palette.accent2;
	const Paints = [InkPaint, AccentPaint, Accent2Paint];
	const ContourOpacity = [Mono ? "0.28" : "0.32", Mono ? "0.24" : "0.30", Mono ? "0.24" : "0.30"];
	const BodyOpacity = [Mono ? "1" : "1", Mono ? "0.55" : "1", Mono ? "0.65" : "1"];

	const BodyPaths = Groups.map((Group) =>
		Group.map((Part) =>
			envelopeOf(Part.points ?? [], Part.width ?? Body, Part.closed ?? true),
		).join(" "),
	);

	const Defs = [];
	for (let Index = 0; Index < 3; Index += 1) {
		if (BodyPaths[Index].trim() !== "") {
			Defs.push(`\t\t<path id="${Prefix}-${NAMES[Index]}" d="${BodyPaths[Index]}"/>`);
		}
	}

	const FillPass = Fills.map((Fill) => {
		const Paint =
			Fill.fill === "tint"
				? (Palette?.tint ?? "currentColor")
				: Fill.fill === "ink"
					? InkPaint
					: Mono
						? "currentColor"
						: AccentPaint;
		const Opacity = Fill.fill === "tint" ? (Mono ? "0.10" : "0.85") : Mono ? "0.18" : "0.95";
		return `\t<path d="${envelopeOf(Fill.points ?? [], Fill.width ?? Body, Fill.closed ?? true)}" fill="${Paint}" fill-opacity="${Opacity}" fill-rule="evenodd" stroke="none"/>`;
	}).join("\n");

	const ContourPass = [0, 1, 2]
		.filter((Index) => BodyPaths[Index].trim() !== "")
		.map(
			(Index) =>
				`\t<g fill="none" stroke="${Paints[Index]}" stroke-width="${HAIRLINE * 2}" stroke-opacity="${ContourOpacity[Index]}" stroke-linejoin="round">\n\t\t<use href="#${Prefix}-${NAMES[Index]}"/>\n\t</g>`,
		)
		.join("\n");
	const BodyPass = [0, 1, 2]
		.filter((Index) => BodyPaths[Index].trim() !== "")
		.map(
			(Index) =>
				`\t<g fill="${Paints[Index]}"${BodyOpacity[Index] === "1" ? "" : ` fill-opacity="${BodyOpacity[Index]}"`} fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-${NAMES[Index]}"/>\n\t</g>`,
		)
		.join("\n");
	const Trace =
		Plan.mode === "traced"
			? `\n\t<g transform="translate(1.2,-1.2)" fill="${InkPaint}" fill-opacity="0.18" fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-i"/>\n\t</g>`
			: "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
	<defs>
${Defs.join("\n")}
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
export const renderColour = (Genome, Plan) =>
	documentOf({ Genome, Plan, Palette: palettesOf(Genome), Mono: false });
