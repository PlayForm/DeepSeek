// RenderScene.mjs - the layered slab renderer.
//
// An icon is a stack of slabs, not a pile of strokes. Every component belongs
// to one layer; each layer is merged into ONE path (one slab) and the slabs are
// painted bottom to top. The SVG is the top view of that stack: an upper slab
// covers the lower one, and the contour of a lower slab disappears under it.
//
// Mono uses one ink with per-layer opacity so the stack still reads; colour
// gives each layer its palette tone.

import { buildComponent } from "./Component.mjs";
import { pathOf } from "./Curve.mjs";
import { palettesOf } from "./Palette.mjs";
import { sceneOf } from "./Transliterate.mjs";

const Layers = ["frame", "body", "detail", "core"];

const ToneOf = (Layer) => {
	switch (Layer) {
		case "core":
			return "accent";
		case "detail":
			return "accent2";
		default:
			return "ink";
	}
};

const OpacityOf = (Layer, Mono, Fill) => {
	if (Layer === "core" && Fill === "tint") {
		return Mono ? "0.35" : "0.55";
	}
	if (Layer === "core" && Fill === "solid") {
		return Mono ? "0.9" : "1";
	}
	if (!Mono) {
		return "1";
	}
	switch (Layer) {
		case "frame":
			return "0.85";
		case "detail":
			return "0.45";
		case "core":
			return "0.65";
		default:
			return "1";
	}
};

const sceneFor = (Genome, Plan) => {
	const Scene = sceneOf(Genome, Plan);
	return Scene.components.map((Component) => ({
		...buildComponent(Component),
		fill: Component.fill,
	}));
};

const label = (Genome, Plan) => `${Genome.package} - ${Plan.grammar}`;

const escape = (Text) =>
	Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const documentOf = ({ Genome, Plan, Palette, Mono }) => {
	const Built = sceneFor(Genome, Plan);
	const Prefix = String(Genome.dir).replace(/[^a-z0-9-]/gi, "-");
	const PaintOf = (Layer) => {
		if (Mono) {
			return "currentColor";
		}
		switch (ToneOf(Layer)) {
			case "accent":
				return Palette.accent;
			case "accent2":
				return Palette.accent2;
			default:
				return Palette.ink;
		}
	};

	const Slabs = new Map();
	for (const Component of Built) {
		const Layer = Layers.includes(Component.composition.collisionGroup)
			? Component.composition.collisionGroup
			: "body";
		const Cutouts = (Component.cutout ?? []).map((Polygon) => pathOf(Polygon, true)).join(" ");
		const Path = Cutouts === "" ? Component.envelope : `${Component.envelope} ${Cutouts}`;
		if (!Slabs.has(Layer)) {
			Slabs.set(Layer, []);
		}
		Slabs.get(Layer).push(Path);
	}
	const Order = Layers.filter((Layer) => Slabs.has(Layer));
	const Defs = Order.map(
		(Layer) => `\t\t<path id="${Prefix}-${Layer}" d="${Slabs.get(Layer).join(" ")}"/>`,
	).join("\n");
	const Pass = Order.map((Layer) => {
		const Fill = `\t<g fill="${PaintOf(Layer)}" fill-opacity="${OpacityOf(Layer, Mono, Plan.fill)}" fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-${Layer}"/>\n\t</g>`;
		const Contour = `\t<g fill="none" stroke="${PaintOf(Layer)}" stroke-width="1.1" stroke-opacity="${Mono ? 0.3 : 0.35}" stroke-linejoin="round">\n\t\t<use href="#${Prefix}-${Layer}"/>\n\t</g>`;
		return `${Fill}\n${Contour}`;
	}).join("\n");
	const Trace =
		Plan.mode === "traced" && Slabs.has("body")
			? `\n\t<g transform="translate(1.2,-1.2)" fill="${PaintOf("body")}" fill-opacity="0.16" fill-rule="evenodd" stroke="none">\n\t\t<use href="#${Prefix}-body"/>\n\t</g>`
			: "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
	<defs>
${Defs}
	</defs>
${Pass}${Trace}
</svg>
`;
};

export const renderMono = (Genome, Plan) => documentOf({ Genome, Plan, Palette: null, Mono: true });

export const renderColour = (Genome, Plan) =>
	documentOf({ Genome, Plan, Palette: palettesOf(Genome), Mono: false });

export const sceneOfPackage = (Genome, Plan) => sceneFor(Genome, Plan);
