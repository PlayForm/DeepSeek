// Composition.mjs - the composition matrix: profile -> form -> family.
//
// Grammar.mjs decided a family from the package KIND and a symmetry from a hash.
// This module replaces that decision with an explicit matrix: the functional
// profile (role, flow, stateful, streaming, branching, containment, weight)
// selects the FORM, the seed picks between the form's two family candidates, and
// the derived symmetry, phase, density and void carry the rest of the silhouette.
//
// The compatibility rules at the bottom are the constraints the matrix must never
// violate: a dense body sparsens the rim, a large void restrains the detail, a
// family with its own frame carries no ledger beads, high symmetry caps the
// detail, a streaming flow fixes the phase, a stateful profile nests a core void.
// Every applied rule is RECORDED as { rule, because } so the transliterator obeys
// it without re-deriving it.
//
// The module is pure and deterministic: no filesystem, no clock, no Infer.mjs.
// One profile and one seed always produce the same composition.

import { digest, stream } from "./Prng.mjs";

/** The eight forms: the role's column of the matrix, with its two family candidates. */
const Forms = {
	interceptor: { form: "star", families: ["spikeStar", "crossStar"] },
	transformer: { form: "chevron", families: ["chevronRing", "divisionTile"] },
	router: { form: "trellis", families: ["trellisKnot", "octagonStar"] },
	store: { form: "diamond", families: ["diamondLattice", "knotSquare"] },
	renderer: { form: "rosette", families: ["rosette", "quatrefoil"] },
	governor: { form: "scallop", families: ["scallopRing", "knotSquare"] },
	orchestrator: { form: "hexagon", families: ["isometricTiles", "octagonStar"] },
	analyzer: { form: "ring", families: ["crescentRing", "teardropOrbit"] },
};

/** The symmetry ladder: branching climbs it, a bidirectional flow pushes one step. */
const Symmetries = [4, 6, 8, 12];

/** The phase degrees a non-streaming composition may take. */
const Phases = [0, 15, 30, 45, 60, 90];

/** The accent each role carries: where the eye lands first. */
const Accents = {
	interceptor: "interruption",
	transformer: "core",
	router: "balance",
	store: "orbit",
	renderer: "core",
	governor: "interruption",
	orchestrator: "balance",
	analyzer: "orbit",
};

/** The families that draw a frame of their own: a ledger bead would crowd the rim. */
const FramedFamilies = new Set([
	"diamondLattice",
	"knotSquare",
	"trellisKnot",
	"scallopRing",
	"octagonStar",
	"divisionTile",
	"isometricTiles",
	"quatrefoil",
]);

/**
 * The family -> form projection. The two families shared by two roles keep the
 * form of the first role that lists them (knotSquare: store, octagonStar: router).
 */
export const FORM_OF = {
	spikeStar: "star",
	crossStar: "star",
	chevronRing: "chevron",
	divisionTile: "chevron",
	trellisKnot: "trellis",
	octagonStar: "trellis",
	diamondLattice: "diamond",
	knotSquare: "diamond",
	rosette: "rosette",
	quatrefoil: "rosette",
	scallopRing: "scallop",
	isometricTiles: "hexagon",
	crescentRing: "ring",
	teardropOrbit: "ring",
};

/** The symmetry of a branching count: the ladder index, pushed one step by a bidirectional flow. */
const symmetryOf = (Branching, Flow) => {
	const Index = Math.min(3, Math.max(0, Branching) + (Flow === "bidirectional" ? 1 : 0));
	return Symmetries[Index];
};

/** The density of a weight: its tier, one tier up for a transformer or a renderer. */
const densityOf = (Weight, Role) => {
	const Tier = Weight <= 1 ? 0 : Weight <= 3 ? 1 : 2;
	const Bump = Role === "transformer" || Role === "renderer" ? 1 : 0;
	return Math.min(3, Tier + Bump);
};

/** The void of a containment count: how much open interior the motif keeps. */
const voidOf = (Containment) => (Containment <= 1 ? 0 : Containment <= 3 ? 1 : 2);

/** The composition of one package: the matrix cell its profile and seed select. */
export const compositionOf = (Profile, Seed) => {
	const Role = Forms[Profile.role] === undefined ? "analyzer" : Profile.role;
	const Entry = Forms[Role];
	const Flow = typeof Profile.flow === "string" ? Profile.flow : "internal";
	const Streaming = Profile.streaming === true;
	const Stateful = Profile.stateful === true;
	const Branching = Math.max(0, Math.min(4, Number(Profile.branching) || 0));
	const Weight = Math.max(0, Math.min(4, Number(Profile.weight) || 0));
	const Containment = Math.max(0, Math.min(4, Number(Profile.containment) || 0));

	const Random = stream(digest(`${Seed}|composition`));
	const Family = Random.pick(Entry.families);
	const Symmetry = symmetryOf(Branching, Flow);
	const Phase = Streaming ? 0 : Random.pick(Phases);
	const Density = densityOf(Weight, Role);
	const Void = Math.min(2, voidOf(Containment) + (Stateful ? 1 : 0));

	const Rules = [];
	if (Density >= 2) {
		Rules.push({
			rule: "dense-body-sparse-rim",
			because: `density ${Density} packs the body`,
		});
	}
	if (Void >= 1) {
		Rules.push({
			rule: "large-void-restrained-detail",
			because: `void ${Void} keeps the interior open`,
		});
	}
	if (FramedFamilies.has(Family)) {
		Rules.push({
			rule: "framed-rim-restrained",
			because: `${Family} draws its own frame`,
		});
	}
	if (Symmetry >= 12) {
		Rules.push({
			rule: "high-symmetry-restraint",
			because: `symmetry ${Symmetry} already divides the rim`,
		});
	}
	if (Streaming) {
		Rules.push({
			rule: "streaming-direction",
			because: "a streaming profile reads as phase zero",
		});
	}
	if (Stateful) {
		Rules.push({
			rule: "stateful-core",
			because: "a stateful profile nests a core void",
		});
	}

	return {
		role: Role,
		form: Entry.form,
		family: Family,
		symmetry: Symmetry,
		phase: Phase,
		density: Density,
		void: Void,
		accent: Accents[Role],
		rules: Rules,
		evidence: [
			`role ${Role}`,
			`flow ${Flow}`,
			`branching ${Branching} of 4`,
			`weight ${Weight} of 4`,
			`containment ${Containment} of 4`,
			`family ${Family} of ${Entry.families.join("/")}`,
		],
	};
};
