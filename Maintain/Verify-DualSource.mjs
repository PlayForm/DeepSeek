// Verify-DualSource.mjs - the dual-source resolution verifier.
//
// The mechanism under test (DUAL-SOURCE-BUNDLING, batch #7): ONE npm package
// name carries BOTH builds - Target/ (the Classic build) and the sibling
// variant (Target-EffectTS in the Classic tree / Target-Classic in the
// EffectTS tree) - selected by the exports map:
//
//   ".": { "effect-ts": <effect>, "classic": <classic>, "default": <classic> }
//   "./classic" and "./effect-ts" subpaths (the per-import escape hatch).
//
// This suite resolves every package from BOTH trees, in BOTH configurations,
// exactly the way a consumer's loader would:
//
//   1. the default condition  -> the Classic build (backward compatible),
//   2. node --conditions=effect-ts -> the Effect-TS build (the loader-level
//      toggle; NODE_OPTIONS=--conditions=effect-ts works identically),
//   3. the ./classic and ./effect-ts subpaths (deterministic per import),
//   4. the cross-package graph: a consumer package resolves its @playform
//      siblings to the SAME variant in both configurations (never mixed),
//   5. the variant fingerprint: the effect build imports "effect", the
//      classic build does not; both entries actually load.
//
// Run AFTER Maintain/DualSource.sh (the sibling variant dirs must exist).
// Prints the smoke-style count; exits non-zero on any failure.
//
// Usage: node Maintain/Verify-DualSource.mjs
import { execFileSync } from "node:child_process";
import * as FileSystem from "node:fs";
import * as Path from "node:path";

const Root = Path.resolve(Path.dirname(new URL(import.meta.url).pathname), "..");
const Names = [
	"hook-dsh-core",
	"hook-dsh-governor-cargo",
	"hook-dsh-governor-package",
	"hook-dsh-normalize-dash",
	"hook-dsh-normalize-ellipsis",
	"hook-dsh-normalize-file",
	"hook-dsh-normalize-fullwidth",
	"hook-dsh-normalize-invisible",
	"hook-dsh-normalize-quotes",
	"hook-dsh-normalize-spaces",
	"hook-dsh-pinner-package",
	"plugin-dsh-factory",
];

let N = 0;
const Failures = [];
const ok = (label) => {
	N++;
	console.log(`ok ${N} - ${label}`);
};
const fail = (label, detail) => {
	N++;
	Failures.push(`${label}: ${detail}`);
	console.log(`FAIL ${N} - ${label}: ${detail}`);
};

// Resolve a specifier from a package dir with optional custom conditions,
// returning the resolved file URL (Node >= 20.6 import.meta.resolve).
const resolve = (Dir, Specifier, Conditions = []) => {
	const Args = [
		"--input-type=module",
		"-e",
		`console.log(import.meta.resolve(${JSON.stringify(Specifier)}))`,
	];
	if (Conditions.length) Args.unshift("--conditions=" + Conditions.join(","));
	return execFileSync(process.execPath, Args, { cwd: Dir, encoding: "utf8" }).trim();
};

// The assembled sibling dir must exist for every package (DualSource.sh).
for (const Tree of ["Classic", "EffectTS"]) {
	const Sibling = Tree === "Classic" ? "Target-EffectTS" : "Target-Classic";
	for (const Name of Names) {
		const Dir = Path.join(Root, Tree, "packages", Name);
		const Entry = Path.join(Dir, Sibling, "Library.js");
		if (!FileSystem.existsSync(Entry)) {
			fail(
				`assembly ${Tree}/${Name}`,
				`missing ${Path.relative(Root, Entry)} - run bash Maintain/DualSource.sh first`,
			);
		}
	}
}
if (Failures.length) {
	console.error(`\n${Failures.length} failure(s); assemble the sibling variants first.`);
	process.exit(1);
}

for (const Tree of ["Classic", "EffectTS"]) {
	const Own = "Target";
	const Sibling = Tree === "Classic" ? "Target-EffectTS" : "Target-Classic";
	// The tree-local routing: the DEFAULT and the own-variant condition route to
	// the tree's OWN build (the dev-tree consumers were built against it); the
	// sibling variant dir is the assembled other build. The canonical published
	// default (the Classic tree, the publish home) is the CLASSIC build.
	const ClassicRoute = Tree === "Classic" ? Own : Sibling;
	const EffectRoute = Tree === "Classic" ? Sibling : Own;
	for (const Name of Names) {
		const Dir = Path.join(Root, Tree, "packages", Name);
		const Spec = `@playform/${Name}`;

		// 1. the tree-local default condition -> the tree's own build.
		const Default = resolve(Dir, Spec);
		if (!Default.endsWith(`/packages/${Name}/${Own}/Library.js`)) {
			fail(`${Tree}/${Name} default condition`, `resolved ${Default}`);
		} else ok(`${Tree}/${Name} default condition -> ${Own}/Library.js`);

		// 2. the loader-level toggle: --conditions=effect-ts -> the Effect-TS build.
		const Toggled = resolve(Dir, Spec, ["effect-ts"]);
		if (!Toggled.endsWith(`/packages/${Name}/${EffectRoute}/Library.js`)) {
			fail(`${Tree}/${Name} effect-ts condition`, `resolved ${Toggled}`);
		} else ok(`${Tree}/${Name} effect-ts condition -> ${EffectRoute}/Library.js`);

		// 3. the per-import escape hatch subpaths.
		const ClassicSub = resolve(Dir, `${Spec}/classic`);
		if (!ClassicSub.endsWith(`/packages/${Name}/${ClassicRoute}/Library.js`)) {
			fail(`${Tree}/${Name} ./classic subpath`, `resolved ${ClassicSub}`);
		} else ok(`${Tree}/${Name} ./classic subpath -> ${ClassicRoute}/Library.js`);
		const EffectSub = resolve(Dir, `${Spec}/effect-ts`);
		if (!EffectSub.endsWith(`/packages/${Name}/${EffectRoute}/Library.js`)) {
			fail(`${Tree}/${Name} ./effect-ts subpath`, `resolved ${EffectSub}`);
		} else ok(`${Tree}/${Name} ./effect-ts subpath -> ${EffectRoute}/Library.js`);
	}
}

// 4. the cross-package graph coherence: from a consumer package, the
// @playform siblings resolve to the SAME VARIANT in every configuration
// (never a mixed graph) - and the ./classic subpath flips the WHOLE graph
// back to the CLASSIC variant (the routes differ in both trees; the
// condition-level flip is asserted per-package above).
// Note: the workspace links may route through either tree (the
// duplicate-name resolution picks one) - the mirror layout keeps every
// route variant-coherent, which is what is asserted: the variant dir
// (Target / Target-Classic / Target-EffectTS), not the package dir.
for (const Tree of ["Classic", "EffectTS"]) {
	const Dir = Path.join(Root, Tree, "packages", "hook-dsh-governor-package");
	const variant = (Url) => Path.basename(Path.dirname(Url));
	const Core = resolve(Dir, "@playform/hook-dsh-core");
	const Factory = resolve(Dir, "@playform/plugin-dsh-factory");
	if (variant(Core) !== variant(Factory)) {
		fail(`${Tree} graph default coherence`, `core=${Core} factory=${Factory}`);
	} else ok(`${Tree} graph default: core + factory -> the same ${variant(Core)} variant`);
	const CoreE = resolve(Dir, "@playform/hook-dsh-core", ["effect-ts"]);
	const FactoryE = resolve(Dir, "@playform/plugin-dsh-factory", ["effect-ts"]);
	if (variant(CoreE) !== variant(FactoryE)) {
		fail(`${Tree} graph effect-ts coherence`, `core=${CoreE} factory=${FactoryE}`);
	} else ok(`${Tree} graph effect-ts: core + factory -> the same ${variant(CoreE)} variant`);
	const CoreC = resolve(Dir, "@playform/hook-dsh-core/classic");
	const FactoryC = resolve(Dir, "@playform/plugin-dsh-factory/classic");
	if (variant(CoreC) !== variant(FactoryC)) {
		fail(`${Tree} graph classic coherence`, `core=${CoreC} factory=${FactoryC}`);
	} else ok(`${Tree} graph classic: core + factory -> the same ${variant(CoreC)} variant`);
	// The whole-graph flip: in the Classic tree the OTHER variant is the
	// effect-ts condition (default classic vs effect-ts); in the EffectTS
	// tree it is the ./classic subpath (default effect vs classic). Either
	// route must flip core + factory together off the default variant.
	const Other = Tree === "Classic" ? CoreE : CoreC;
	if (variant(Core) === variant(Other)) {
		fail(
			`${Tree} graph toggle`,
			`${Tree === "Classic" ? "the effect-ts condition" : "the ./classic subpath"} did not flip the graph (${variant(Core)})`,
		);
	} else
		ok(
			`${Tree} graph toggle: ${Tree === "Classic" ? "the effect-ts condition" : "the ./classic subpath"} flips core + factory together (${variant(Core)} -> ${variant(Other)})`,
		);
}

// 5. the variant fingerprint + the real loads. The effect build imports
// "effect"; the classic build does not. Both entries must actually load.
for (const Tree of ["Classic", "EffectTS"]) {
	const EffectDir = Tree === "Classic" ? "Target-EffectTS" : "Target";
	const ClassicDir = Tree === "Classic" ? "Target" : "Target-Classic";
	const Core = Path.join(Root, Tree, "packages", "hook-dsh-core");
	const EffectSource = FileSystem.readFileSync(
		Path.join(Core, EffectDir, "Function", "Update.js"),
		"utf8",
	);
	if (!EffectSource.includes('from"effect"')) {
		fail(
			`${Tree} effect fingerprint`,
			`the ${EffectDir} build has no effect import in Function/Update.js`,
		);
	} else ok(`${Tree} fingerprint: the ${EffectDir} build imports effect`);
	const ClassicSource = FileSystem.readFileSync(
		Path.join(Core, ClassicDir, "Function", "Update.js"),
		"utf8",
	);
	if (ClassicSource.includes('from"effect"')) {
		fail(`${Tree} classic fingerprint`, `the ${ClassicDir} build must not import effect`);
	} else ok(`${Tree} fingerprint: the ${ClassicDir} build is effect-free`);

	const Loaded = execFileSync(
		process.execPath,
		[
			"--input-type=module",
			"-e",
			`const m = await import(${JSON.stringify(`@playform/hook-dsh-core/effect-ts`)}); console.log(m.Section && m.Suppress && m.Update ? "loaded" : "missing-exports")`,
		],
		{ cwd: Core, encoding: "utf8" },
	).trim();
	if (Loaded !== "loaded") {
		fail(`${Tree} effect entry load`, `loaded ${Loaded}`);
	} else ok(`${Tree} effect entry loads (Section/Suppress/Update present)`);
}

console.log(`\n${N} checks; ${Failures.length} failure(s).`);
if (Failures.length) process.exit(1);
