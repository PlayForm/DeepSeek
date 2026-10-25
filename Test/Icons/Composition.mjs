#!/usr/bin/env node

// Composition.mjs test - the composition matrix and its compatibility rules.
//
// The fixtures are hand-written profiles, not Infer.mjs output: the module under
// test must stay pure, so the test must not drag the filesystem in through Arm A.
// The role table below is restated on purpose - the test arbitrates the SPEC, not
// the implementation, so a drifted matrix fails here even when the module agrees
// with itself.

import { compositionOf, FORM_OF } from "../../Maintain/Icon/Composition.mjs";
import { familiesOf } from "../../Maintain/Icon/Motif.mjs";

const Families = new Set(familiesOf());
const Symmetries = new Set([4, 6, 8, 12]);
const Phases = new Set([0, 15, 30, 45, 60, 90]);

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

const profileOf = (Role, Flow, Overrides = {}) => ({
	role: Role,
	flow: Flow,
	stateful: false,
	streaming: false,
	branching: 1,
	containment: 1,
	weight: 1,
	evidence: [],
	confidence: "inferred",
	...Overrides,
});

const Cases = [
	{
		name: "interceptor",
		seed: "3f2a91c4",
		profile: profileOf("interceptor", "inbound", { branching: 1, containment: 1, weight: 2 }),
	},
	{
		name: "transformer",
		seed: "b7c1d0e2",
		profile: profileOf("transformer", "outbound", { branching: 2, containment: 2, weight: 3 }),
	},
	{
		name: "router",
		seed: "9a4e6f10",
		profile: profileOf("router", "bidirectional", { branching: 3, containment: 2, weight: 2 }),
	},
	{
		name: "store",
		seed: "c05d8b31",
		profile: profileOf("store", "internal", {
			stateful: true,
			branching: 1,
			containment: 3,
			weight: 2,
		}),
	},
	{
		name: "renderer",
		seed: "1e7f3a58",
		profile: profileOf("renderer", "outbound", { branching: 0, containment: 1, weight: 4 }),
	},
	{
		name: "governor",
		seed: "6b2c9d47",
		profile: profileOf("governor", "inbound", { branching: 2, containment: 2, weight: 1 }),
	},
	{
		name: "orchestrator",
		seed: "d83a5f60",
		profile: profileOf("orchestrator", "bidirectional", {
			streaming: true,
			branching: 4,
			containment: 4,
			weight: 4,
		}),
	},
	{
		name: "analyzer",
		seed: "4c9b2e71",
		profile: profileOf("analyzer", "internal", { branching: 1, containment: 0, weight: 0 }),
	},
	{
		name: "edge-branching-0",
		seed: "a0b1c2d3",
		profile: profileOf("analyzer", "internal", { branching: 0, containment: 0, weight: 1 }),
	},
	{
		name: "edge-branching-4",
		seed: "e4f5a6b7",
		profile: profileOf("interceptor", "inbound", { branching: 4, containment: 1, weight: 2 }),
	},
	{
		name: "edge-streaming",
		seed: "c8d9e0f1",
		profile: profileOf("transformer", "outbound", {
			streaming: true,
			branching: 2,
			containment: 2,
			weight: 3,
		}),
	},
	{
		name: "edge-weight-4",
		seed: "1234abcd",
		profile: profileOf("renderer", "outbound", { branching: 1, containment: 1, weight: 4 }),
	},
	{
		name: "edge-containment-4",
		seed: "5678ef01",
		profile: profileOf("analyzer", "internal", { branching: 2, containment: 4, weight: 2 }),
	},
	{
		name: "edge-stateful",
		seed: "9abcdef0",
		profile: profileOf("analyzer", "internal", {
			stateful: true,
			branching: 1,
			containment: 0,
			weight: 1,
		}),
	},
];

const ProblemsOf = (Case, Composition) => {
	const Problems = [];
	const expect = (Ok, Message) => {
		if (!Ok) {
			Problems.push(Message);
		}
	};
	const Role = Case.profile.role;
	const Entry = Forms[Role];
	const Rules = Array.isArray(Composition.rules) ? Composition.rules : [];
	const has = (Name) => Rules.some((Rule) => Rule.rule === Name);

	expect(Composition.role === Role, `role ${Composition.role}`);
	expect(Families.has(Composition.family), `family ${Composition.family} is not a Motif family`);
	expect(
		Entry.families.includes(Composition.family),
		`family ${Composition.family} outside the ${Entry.form} candidates`,
	);
	expect(Composition.form === Entry.form, `form ${Composition.form} over ${Entry.form}`);
	expect(Symmetries.has(Composition.symmetry), `symmetry ${Composition.symmetry}`);
	expect(Phases.has(Composition.phase), `phase ${Composition.phase}`);
	expect(
		Number.isInteger(Composition.density) && Composition.density >= 0 && Composition.density <= 3,
		`density ${Composition.density}`,
	);
	expect(
		Number.isInteger(Composition.void) && Composition.void >= 0 && Composition.void <= 2,
		`void ${Composition.void}`,
	);
	expect(typeof Composition.accent === "string" && Composition.accent !== "", "no accent");
	expect(Array.isArray(Composition.evidence) && Composition.evidence.length >= 2, "thin evidence");
	expect(Array.isArray(Composition.rules), "rules is not an array");
	for (const Rule of Rules) {
		expect(
			typeof Rule.rule === "string" &&
				Rule.rule !== "" &&
				typeof Rule.because === "string" &&
				Rule.because !== "",
			`rule entry ${JSON.stringify(Rule)}`,
		);
	}

	if (Composition.density >= 2) {
		expect(has("dense-body-sparse-rim"), "density >= 2 without dense-body-sparse-rim");
	}
	if (Composition.void >= 1) {
		expect(has("large-void-restrained-detail"), "void >= 1 without large-void-restrained-detail");
	}
	if (FramedFamilies.has(Composition.family)) {
		expect(has("framed-rim-restrained"), `${Composition.family} without framed-rim-restrained`);
	}
	if (Composition.symmetry >= 12) {
		expect(has("high-symmetry-restraint"), "symmetry >= 12 without high-symmetry-restraint");
	}
	if (Case.profile.streaming === true) {
		expect(Composition.phase === 0, `streaming phase ${Composition.phase}`);
		expect(has("streaming-direction"), "streaming without streaming-direction");
	}
	if (Case.profile.stateful === true) {
		expect(Composition.void >= 1, `stateful void ${Composition.void}`);
		expect(has("stateful-core"), "stateful without stateful-core");
	}

	const Again = compositionOf(Case.profile, Case.seed);
	expect(JSON.stringify(Again) === JSON.stringify(Composition), "same inputs differ");

	return Problems;
};

const Results = [];
const record = (Name, Ok, Detail) => {
	Results.push({ Name, Ok, Detail });
	console.log(`${Ok ? "PASS" : "FAIL"}  ${Name}${Detail === "" ? "" : ` - ${Detail}`}`);
};

console.log(`Composition report - ${Cases.length} fixture profiles\n`);

const Compositions = [];
for (const Case of Cases) {
	const Composition = compositionOf(Case.profile, Case.seed);
	const Problems = ProblemsOf(Case, Composition);
	const Detail =
		Problems.length === 0
			? `${Composition.form}/${Composition.family}, symmetry ${Composition.symmetry}, phase ${Composition.phase}, density ${Composition.density}, void ${Composition.void}`
			: Problems.join("; ");
	record(Case.name, Problems.length === 0, Detail);
	Compositions.push(Composition);
}

const Roles = Object.keys(Forms);
const CountOf = new Map();
for (const Entry of Object.values(Forms)) {
	for (const Family of Entry.families) {
		CountOf.set(Family, (CountOf.get(Family) ?? 0) + 1);
	}
}
const Shared = new Set(
	[...CountOf.entries()].filter(([, Count]) => Count > 1).map(([Family]) => Family),
);

const Missing = [...Families].filter((Family) => typeof FORM_OF[Family] !== "string");
record(
	"FORM_OF: every family maps to a form",
	Missing.length === 0 && Object.keys(FORM_OF).length === Families.size,
	`${Object.keys(FORM_OF).length} of ${Families.size} families`,
);

const FormLabels = new Set(Roles.map((Role) => Forms[Role].form));
const Unknown = Object.entries(FORM_OF).filter(([, Form]) => !FormLabels.has(Form));
record("FORM_OF: every value is a declared form", Unknown.length === 0, `${FormLabels.size} labels`);

const Drifted = Object.entries(FORM_OF).filter(
	([Family, Form]) =>
		!Shared.has(Family) &&
		!Object.values(Forms).some((Entry) => Entry.families.includes(Family) && Entry.form === Form),
);
record(
	"FORM_OF: a family keeps its role's form",
	Drifted.length === 0,
	`${Shared.size} shared families`,
);

const Seeds = Array.from({ length: 8 }, (_, Index) => `0000000${Index}`);
const Thin = [];
for (const Role of Roles) {
	const Profile = profileOf(Role, "internal");
	const Picked = new Set(Seeds.map((Seed) => compositionOf(Profile, Seed).family));
	if (Picked.size < Forms[Role].families.length) {
		Thin.push(Role);
	}
}
record(
	"variation: both candidate families reachable",
	Thin.length === 0,
	Thin.length === 0 ? `${Roles.length} roles x ${Seeds.length} seeds` : Thin.join(", "),
);

const Used = new Set(Compositions.map((Composition) => Composition.family));
record(
	"distinctness: at least 6 families across the fixtures",
	Used.size >= 6,
	`${Used.size} of ${Families.size} families`,
);

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} composition checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
