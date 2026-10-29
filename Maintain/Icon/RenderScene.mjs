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
// Each painted group also carries the motion of the feature it encodes
// (Motion.mjs): the groups are keyed by tone AND motion, a firing element keeps
// a group of its own so the taps fire in sequence, and the whole scene sits
// inside one prefixed wrapper, so the style block scopes its rules and the
// reduced-motion guard covers every group at once.

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

/** The painted groups: one per tone and motion, in depth order, fire alone. */
const groupsOf = (Built, Genome) => {
	const Sorted = [...Built].sort(
		(A, B) => (A.composition.depth ?? 0) - (B.composition.depth ?? 0),
	);
	const Groups = [];
	let Firing = 0;
	for (const Component of Sorted) {
		const Tone = Component.material.tone ?? "ink";
		const Motion = motionOf(Component, Genome.profile ?? {});
		const Last = Groups[Groups.length - 1];
		if (
			Motion === "fire" ||
			Last === undefined ||
			Last.tone !== Tone ||
			Last.motion !== Motion
		) {
			Groups.push({
				tone: Tone,
				motion: Motion,
				paths: [],
				stagger: Motion === "fire" ? Firing : 0,
			});
			if (Motion === "fire") {
				Firing += 1;
			}
		}
		Groups[Groups.length - 1].paths.push(pathOfComponent(Component));
	}
	return Groups;
};

const documentOf = ({ Genome, Plan, Palette, Mono }) => {
	const Built = sceneFor(Genome, Plan);
	const Prefix = String(Genome.dir).replace(/[^a-z0-9-]/gi, "-");
	const Clock = clockOf(Genome);
	const Groups = groupsOf(Built, Genome);
	const Traced = Plan.mode === "traced";
	const Used = Order.filter((Name) =>
		Name === "trace" ? Traced : Groups.some((Group) => Group.motion === Name),
	);
	const Gap = Mono
		? ""
		: ' stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke fill"';
	const Defs = Groups.map(
		(Group, Index) => `\t\t<path id="${Prefix}-${Index}" d="${Group.paths.join(" ")}"/>`,
	).join("\n");
	const Pass = Groups.map((Group, Index) => {
		const Paint = `fill="${PaintOf(Group.tone, Palette, Mono)}" fill-opacity="${AlphaOf(Group.tone, Mono)}" fill-rule="evenodd"${Gap}`;
		const Motion =
			Group.motion === null
				? ""
				: ` class="${Prefix}-${Group.motion}"${
						Group.motion === "fire"
							? ` style="animation-delay:${offsetOf(Clock, Group.stagger)}"`
							: ""
					}`;
		return `\t<g${Motion} ${Paint}>\n\t\t<use href="#${Prefix}-${Index}"/>\n\t</g>`;
	}).join("\n");
	const BodyIndex = Groups.findIndex((Group) => Group.tone === "ink");
	const Trace =
		Traced && BodyIndex >= 0
			? `\n\t<g class="${Prefix}-trace" fill="${PaintOf("ink", Palette, Mono)}" fill-opacity="0.18" fill-rule="evenodd" stroke="none">\n\t\t<g transform="translate(1.2,-1.2)">\n\t\t\t<use href="#${Prefix}-${BodyIndex}"/>\n\t\t</g>\n\t</g>`
			: "";
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${escape(label(Genome, Plan))}">
	<title>${escape(label(Genome, Plan))}</title>
${styleOf(Prefix, Clock, Used)}
	<defs>
${Defs}
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
