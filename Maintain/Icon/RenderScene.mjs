// RenderScene.mjs - the solid-path renderer.
//
// Every component is a filled path with a solid colour (a palette tone). The
// scene paints its paths in depth order; an upper path covers the lower one.
// There is no stroke and no contour: an icon is a stack of solid shapes, and
// the SVG is the top view of that stack.
//
// Mono has one ink, so a tone is carried by opacity there (ink 1, accent 0.75,
// accent2 0.55, tint 0.3); colour uses the palette tone at full opacity.
//
// Each element also carries the motion of the feature it encodes (Motion.mjs).
// Consecutive components of one tone share one painted group, so the paint
// order stays the depth order and the file stays small, while every <use> owns
// its motion class and a firing element owns its staggered delay. The whole
// scene sits inside one prefixed wrapper, so the style block scopes its rules
// and the reduced-motion guard covers every element at once.

import { buildComponent } from "./Component.mjs";
import { pathOf } from "./Curve.mjs";
import { clockOf, motionOf, offsetOf, Order, styleOf } from "./Motion.mjs";
import { palettesOf } from "./Palette.mjs";
import { sceneOf } from "./Transliterate.mjs";

const sceneFor = (Genome, Plan) => {
	const Scene = sceneOf(Genome, Plan);
	const Angle = Number(Plan.view ?? 0);
	const Radians = (Angle * Math.PI) / 180;
	const Shift = (Component) => {
		if (Angle === 0) {
			return Component.centerline;
		}
		const Depth = Number(Component.composition.depth ?? 0) - 8;
		return Component.centerline.map((Point) => ({
			x: Point.x + Math.cos(Radians) * Depth * 0.8,
			y: Point.y + Math.sin(Radians) * Depth * 0.8,
		}));
	};
	return Scene.components.map((Component) => ({
		...buildComponent({ ...Component, centerline: Shift(Component) }),
		fill: Component.fill,
	}));
};

const label = (Genome, Plan) => `${Genome.package} - ${Plan.grammar}`;

const escape = (Text) =>
	Text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pathOfComponent = (Component) => {
	const Solid = Component.render !== "ribbon" && Component.geometry.topology === "closed";
	const Body = Solid ? pathOf(Component.centerline, true) : Component.envelope;
	const Cutouts = (Component.cutout ?? []).map((Polygon) => pathOf(Polygon, true)).join(" ");
	return Cutouts === "" ? Body : `${Body} ${Cutouts}`;
};

const PaintOf = (Tone, Palette, Mono) => {
	if (Mono) {
		return "currentColor";
	}
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

const AlphaOf = (Tone, Mono) => {
	if (!Mono) {
		return "1";
	}
	switch (Tone) {
		case "accent":
			return "0.75";
		case "accent2":
			return "0.55";
		case "tint":
			return "0.3";
		default:
			return "1";
	}
};

/** The painted runs: consecutive components of one tone, each with its motion. */
const runsOf = (Built, Genome) => {
	const Sorted = [...Built].sort(
		(A, B) => (A.composition.depth ?? 0) - (B.composition.depth ?? 0),
	);
	const Runs = [];
	let Firing = 0;
	for (const Component of Sorted) {
		const Tone = Component.material.tone ?? "ink";
		const Motion = motionOf(Component, Genome.profile ?? {});
		const Last = Runs[Runs.length - 1];
		if (Last === undefined || Last.tone !== Tone) {
			Runs.push({ tone: Tone, items: [] });
		}
		Runs[Runs.length - 1].items.push({
			path: pathOfComponent(Component),
			motion: Motion,
			stagger: Motion === "fire" ? Firing : 0,
		});
		if (Motion === "fire") {
			Firing += 1;
		}
	}
	return Runs;
};

const documentOf = ({ Genome, Plan, Palette, Mono }) => {
	const Built = sceneFor(Genome, Plan);
	const Prefix = String(Genome.dir).replace(/[^a-z0-9-]/gi, "-");
	const Clock = clockOf(Genome);
	const Runs = runsOf(Built, Genome);
	const Traced = Plan.mode === "traced";
	const Gap = Mono
		? ""
		: ' stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke fill"';
	const Defs = [];
	const Used = [];
	let BodyIndex = -1;
	const Pass = Runs.map((Run) => {
		const Items = Run.items.map((Item) => {
			const Id = `${Prefix}-${Defs.length}`;
			Defs.push(`\t\t<path id="${Id}" d="${Item.path}"/>`);
			if (BodyIndex < 0 && Run.tone === "ink") {
				BodyIndex = Defs.length - 1;
			}
			if (Item.motion !== null && Used.includes(Item.motion) === false) {
				Used.push(Item.motion);
			}
			const Class = Item.motion === null ? "" : ` class="${Prefix}-${Item.motion}"`;
			const Delay =
				Item.motion === "fire"
					? ` style="animation-delay:${offsetOf(Clock, Item.stagger)}"`
					: "";
			return `\t\t<use${Class}${Delay} href="#${Id}"/>`;
		});
		const Paint = `fill="${PaintOf(Run.tone, Palette, Mono)}" fill-opacity="${AlphaOf(Run.tone, Mono)}" fill-rule="evenodd"${Gap}`;
		return `\t<g ${Paint}>\n${Items.join("\n")}\n\t</g>`;
	}).join("\n");
	const MotionUsed = Order.filter((Name) => (Name === "trace" ? Traced : Used.includes(Name)));
	const Trace =
		Traced && BodyIndex >= 0
			? `\n\t<g class="${Prefix}-trace" fill="${PaintOf("ink", Palette, Mono)}" fill-opacity="0.18" fill-rule="evenodd" stroke="none">\n\t\t<g transform="translate(1.2,-1.2)">\n\t\t\t<use href="#${Prefix}-${BodyIndex}"/>\n\t\t</g>\n\t</g>`
			: "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
${styleOf(Prefix, Clock, MotionUsed)}
	<defs>
${Defs.join("\n")}
	</defs>
	<g class="${Prefix}-scene">
${Pass}${Trace}
	</g>
</svg>
`;
};

export const renderMono = (Genome, Plan) => documentOf({ Genome, Plan, Palette: null, Mono: true });

export const renderColour = (Genome, Plan) =>
	documentOf({ Genome, Plan, Palette: palettesOf(Genome), Mono: false });

export const sceneOfPackage = (Genome, Plan) => sceneFor(Genome, Plan);
