#!/usr/bin/env node
//===============================================================================
// Interventions.mjs - the controlled-intervention arbiter.
//===============================================================================
//
// A visual feature is only proven to be feature-driven when changing ONE
// functional input changes the expected components and leaves the identity
// alone. Each case below toggles one input on a fixed identity and declares
// what may change and what must not.
//
// Usage: node Test/Icons/Interventions.mjs
//===============================================================================

import { planOf } from "../../Maintain/Icon/Grammar.mjs";
import { sceneOf } from "../../Maintain/Icon/Transliterate.mjs";

const Base = {
	package: "@playform/hook-dsh-fixture",
	dir: "hook-dsh-fixture",
	kind: "hook",
	tree: "Classic",
	version: "0.2.0",
	domain: "fixture",
	bundle: false,
	seed: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
	features: {
		functions: 2,
		injections: 1,
		events: 0,
		tools: 0,
		seams: 0,
		services: 0,
		changelogVersions: 1,
		changelogEntries: 2,
	},
	mutations: { rings: 0, ticks: 2 },
};

const Tokens = (Overrides = {}) => ({
	gate: [],
	tool: [],
	service: [],
	injection: [],
	seam: [],
	ledger: [],
	refusal: [],
	transform: [],
	stream: [],
	state: [],
	trace: [],
	...Overrides,
});

const build = (GenomeOverrides = {}, TokenOverrides = {}) => {
	const Genome = { ...Base, ...GenomeOverrides };
	const Plan = planOf(Genome);
	return { genome: { ...Genome, plan: Plan, manifest: { tokens: Tokens(TokenOverrides) } }, plan: Plan };
};

const sceneOfCase = (Case) => sceneOf(Case.genome, Case.plan);
const methodsOf = (Scene) => new Set(Scene.components.map((Component) => Component.geometry.method));
const countOf = (Scene, Method) =>
	Scene.components.filter((Component) => Component.geometry.method === Method).length;
const signatureOf = (Scene) =>
	Scene.components
		.map(
			(Component) =>
				`${Component.id}:${Component.centerline
					.map((Point) => `${Math.round(Point.x * 10)}/${Math.round(Point.y * 10)}`)
					.join(",")}`,
		)
		.join("|");

const Results = [];
const record = (Name, Ok, Detail) => {
	Results.push({ Name, Ok, Detail });
	console.log(`${Ok ? "PASS" : "FAIL"}  ${Name}${Detail === "" ? "" : ` - ${Detail}`}`);
};

const Protected = (Before, After, Label) => {
	const Same = Before.plan.family === After.plan.family && Before.plan.order === After.plan.order;
	record(`${Label}: identity protected (family, symmetry)`, Same, `${Before.plan.family}/${Before.plan.order}`);
	const Base = methodsOf(sceneOfCase(Before));
	const Next = methodsOf(sceneOfCase(After));
	const Kept = [...Base].every((Method) => Next.has(Method));
	record(`${Label}: existing methods preserved`, Kept, `${Base.size} base methods`);
};

// 1. events: a gate loop per subscribed event
{
	const Before = build({}, {});
	const After = build({}, { gate: ["start", "stop"] });
	Protected(Before, After, "events");
	record(
		"events: gate loops appear",
		countOf(sceneOfCase(After), "gate-loop") === 2 && countOf(sceneOfCase(Before), "gate-loop") === 0,
		`${countOf(sceneOfCase(Before), "gate-loop")} -> ${countOf(sceneOfCase(After), "gate-loop")}`,
	);
}

// 2. tools: a tool bead per registered tool
{
	const Before = build({}, {});
	const After = build({}, { tool: ["pack"] });
	Protected(Before, After, "tools");
	record(
		"tools: tool beads appear",
		countOf(sceneOfCase(After), "tool-bead") === 1 && countOf(sceneOfCase(Before), "tool-bead") === 0,
		`${countOf(sceneOfCase(Before), "tool-bead")} -> ${countOf(sceneOfCase(After), "tool-bead")}`,
	);
}

// 3. injections: at most two halo rings
{
	const Before = build({}, {});
	const After = build({}, { injection: ["a", "b", "c"] });
	Protected(Before, After, "injections");
	record(
		"injections: halo rings appear",
		countOf(sceneOfCase(After), "injection-ring") === 2 && countOf(sceneOfCase(Before), "injection-ring") === 0,
		`${countOf(sceneOfCase(Before), "injection-ring")} -> ${countOf(sceneOfCase(After), "injection-ring")}`,
	);
}

// 4. changelog: one evolution ring per released version after the first
{
	const Before = build({}, {});
	const After = build({ mutations: { rings: 2, ticks: 5 } }, {});
	Protected(Before, After, "history");
	record(
		"history: evolution rings appear",
		countOf(sceneOfCase(After), "evolution-ring") === 2 && countOf(sceneOfCase(Before), "evolution-ring") === 0,
		`${countOf(sceneOfCase(Before), "evolution-ring")} -> ${countOf(sceneOfCase(After), "evolution-ring")}`,
	);
}

// 5. functions: the detail tier
{
	const Before = build({}, {});
	const After = build({ features: { ...Base.features, functions: 9 } }, {});
	Protected(Before, After, "functions");
	record(
		"functions: detail beads appear",
		countOf(sceneOfCase(After), "detail-bead") === 6 && countOf(sceneOfCase(Before), "detail-bead") === 0,
		`${countOf(sceneOfCase(Before), "detail-bead")} -> ${countOf(sceneOfCase(After), "detail-bead")}`,
	);
}

// 6. tree: the Effect-TS switch changes the render, not the scene
{
	const Before = build({}, {});
	const After = build({ tree: "EffectTS" }, {});
	record(
		"tree: the scene is identical",
		signatureOf(sceneOfCase(Before)) === signatureOf(sceneOfCase(After)),
		`${sceneOfCase(Before).components.length} components`,
	);
	record(
		"tree: only the render mode changes",
		Before.plan.mode === "single" && After.plan.mode === "traced",
		`${Before.plan.mode} -> ${After.plan.mode}`,
	);
}

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} intervention checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
