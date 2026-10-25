// Matrix.mjs - the layer matrix cube (ICON-METHODS.md section 6).
//
// An icon is a stack of LAYER cells. The cube has three axes:
//
//   LAYER   rim | evolution | detail | body | orbit | core      (spatial: outer -> inner)
//   METHOD  closedRing | openRay | cuspPair | openHook | openSpiral |
//           openNeedle | taperSpike | quadrantBlock | webLattice |
//           interlaceBand | squareFrame | voidDiamond | filledWedge |
//           beadString | dotOrbit | tickOrbit | scallopEdge | chevronEdge
//   STYLE   tone (ink/accent/accent2) | cap (butt/round) | join (miter/round) |
//           fill (none/tint/solid/ink) | weight | phase | order
//
// One package selects ONE CELL PER LAYER: the seed picks inside the layer's
// method list, the features gate which methods are allowed, and the style axes
// come from the plan. Stacking the cells in layer order produces the icon, so a
// package's visual identity is DISPERSED across layers and CONVERGES when the
// layers are congregated.
//
// Two consequences the sheet shows and the cube makes explicit:
//   - a layer may be empty (a plain rim over a rich body, or the reverse);
//   - the same method may appear in two layers (a cusp body and a cusp rim),
//     which is how the sheet builds a family resemblance inside one motif.

import { stream } from "./Prng.mjs";

const Layers = ["rim", "evolution", "detail", "body", "orbit", "core"];

/** The method candidates per layer. The first entry is the calm default. */
const Methods = {
	rim: ["frame", "scallop", "chevron", "interlace", "double"],
	evolution: ["rings"],
	detail: ["beads", "ticks", "none"],
	body: ["ring", "cusp", "ray", "hook", "spiral", "needle", "taper", "quadrant", "web", "void"],
	orbit: ["dots", "ticks", "needles", "none"],
	core: ["ring", "void", "wedge"],
};

/** The open methods: the sheet's 17-of-29 open-stroke majority. */
const OpenMethods = new Set(["ray", "hook", "spiral", "needle", "cusp", "chevron", "ticks"]);

/** How open a package is: kind base, seams push open, bundle pushes closed, seed nudges. */
const closureOf = (Genome) => {
	const Base = { hook: 2, plugin: 0, client: 1, lib: 1 }[Genome.kind] ?? 1;
	const Nudge = stream(`${Genome.seed}closure`).pick([-1, 0, 0, 1]);
	return Math.max(
		0,
		Math.min(3, Base + (Genome.features.seams > 0 ? 1 : 0) - (Genome.bundle ? 1 : 0) + Nudge),
	);
};

/** The style axes of one package: the third dimension of the cube. */
const styleOf = (Plan) => ({
	tone: "ink",
	cap: Plan.stroke.cap,
	join: Plan.stroke.join,
	weight: Plan.stroke.weight,
	fill: Plan.fill,
	phase: Plan.jitter.phase,
	order: Plan.order,
});

/** Choose a method for one layer, gated by the closure bias and the layer's level. */
const methodOf = (Layer, Plan, Random, Closure) => {
	const Candidates = Methods[Layer];
	if (Layer === "body") {
		if (Closure >= 2) {
			const Open = Candidates.filter((Name) => OpenMethods.has(Name));
			return Random.pick(Open.length > 0 ? Open : Candidates);
		}
		if (Closure === 0) {
			const Closed = Candidates.filter((Name) => !OpenMethods.has(Name));
			return Random.pick(Closed.length > 0 ? Closed : Candidates);
		}
		return Random.pick(Candidates);
	}
	if (Layer === "orbit") {
		return Closure >= 2 ? Random.pick(["ticks", "needles"]) : Random.pick(["dots", "ticks"]);
	}
	return Random.pick(Candidates);
};

/** The matrix of one package: one cell per layer, in stack order. */
export const matrixOf = (Genome, Plan) => {
	const Random = stream(`${Genome.seed}matrix`);
	const Closure = closureOf(Genome);
	const Style = styleOf(Plan);
	const Cells = Layers.map((Layer) => {
		const Level = Plan.levels[Layer === "evolution" ? "evolution" : Layer] ?? 1;
		const Method = methodOf(Layer, Plan, Random, Closure);
		return {
			layer: Layer,
			level: Level,
			method: Method,
			open: OpenMethods.has(Method),
			style: { ...Style, tone: Layer === "body" ? "ink" : "accent" },
		};
	});
	return { layers: Cells, closure: Closure, style: Style };
};
