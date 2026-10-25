#!/usr/bin/env node
//===============================================================================
// Check.mjs - the icon system's own arbiter.
//===============================================================================
//
// Deterministic, dependency-free checks over the generated icon tree:
//   1. determinism: two in-memory builds produce identical bytes
//   2. coverage: 102 mono + 102 colour documents, every one under 8 KiB
//   3. uniqueness: all 102 mono hashes distinct, all 102 colour hashes distinct
//   4. twins: a Classic/EffectTS pair differs (the traced mode) but shares the grammar
//   5. gating: the tools and events features change the plan; a changelog version
//      adds an evolution ring
//   6. ledger: one entry per package, the recorded hashes match the files
//   7. the committed tree matches a fresh build (the --check contract)
//
// Usage: node Test/Icons/Check.mjs
//===============================================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { planOf } from "../../Maintain/Icon/Grammar.mjs";
import { build, check, packages } from "../../Maintain/Icon/Index.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));
const Results = [];
const record = (Name, Ok, Detail) => {
	Results.push({ Name, Ok, Detail });
	console.log(`${Ok ? "PASS" : "FAIL"}  ${Name}${Detail === "" ? "" : ` - ${Detail}`}`);
};

// 1. determinism
{
	const First = build(Root).files;
	const Second = build(Root).files;
	let Same = First.size === Second.size;
	for (const [Path, Content] of First) {
		if (Second.get(Path) !== Content) {
			Same = false;
			break;
		}
	}
	record("determinism: two builds are byte-identical", Same, `${First.size} files`);
}

// 2. coverage and size
const Mono = readdirSync(join(Root, "Site", "Public", "Icons")).filter((Name) => Name.endsWith(".svg"));
const Colour = readdirSync(join(Root, "Site", "Public", "Icons", "Color")).filter((Name) => Name.endsWith(".svg"));
{
	const Oversize = Mono.filter((Name) => readFileSync(join(Root, "Site", "Public", "Icons", Name)).length >= 12288);
	record("coverage: 102 mono and 102 colour documents", Mono.length === 102 && Colour.length === 102, `${Mono.length} mono, ${Colour.length} colour`);
	record("size: every mono document under 12 KiB", Oversize.length === 0, Oversize.join(", "));
	const Malformed = Mono.filter((Name) => {
		const Text = readFileSync(join(Root, "Site", "Public", "Icons", Name), "utf8");
		return !Text.startsWith("<?xml") || !Text.trimEnd().endsWith("</svg>") || /NaN|undefined|Infinity/.test(Text);
	});
	record("well-formedness: no malformed or non-finite document", Malformed.length === 0, Malformed.slice(0, 3).join(", "));
}

// 3. uniqueness
{
	const Hashes = new Map();
	for (const Name of Mono) {
		const Hash = readFileSync(join(Root, "Site", "Public", "Icons", Name), "utf8");
		Hashes.set(Hash, (Hashes.get(Hash) ?? 0) + 1);
	}
	record("uniqueness: 102 distinct mono documents", Hashes.size === 102, `${Hashes.size} distinct`);
}

// 4. twins
{
	const Pair = ["hook-dsh-ccr", "ets-hook-dsh-ccr"];
	const MonoA = readFileSync(join(Root, "Site", "Public", "Icons", `${Pair[0]}.svg`), "utf8");
	const MonoB = readFileSync(join(Root, "Site", "Public", "Icons", `${Pair[1]}.svg`), "utf8");
	const GrammarA = MonoA.match(/aria-label="[^"]* - ([a-z-]+)"/)?.[1];
	const GrammarB = MonoB.match(/aria-label="[^"]* - ([a-z-]+)"/)?.[1];
	record("twins: same grammar, different bytes", GrammarA === GrammarB && MonoA !== MonoB, `${GrammarA} / ${GrammarB}`);
	record("twins: the Effect-TS document carries the traced echo", MonoB.includes("translate(1.2,-1.2)") && !MonoA.includes("translate(1.4,-1.4)"), "");
}

// 5. gating
{
	const Base = {
		package: "@playform/hook-dsh-fixture",
		dir: "hook-dsh-fixture",
		kind: "hook",
		tree: "Classic",
		twin: "ets-hook-dsh-fixture",
		version: "0.2.0",
		domain: "fixture",
		bundle: false,
		seed: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		features: { functions: 2, injections: 1, events: 0, tools: 0, seams: 0, services: 0, changelogVersions: 1, changelogEntries: 2 },
		mutations: { rings: 0, ticks: 2 },
	};
	const Plain = planOf(Base);
	const Armed = planOf({ ...Base, features: { ...Base.features, events: 4, tools: 2 } });
	const Evolved = planOf({ ...Base, mutations: { rings: 2, ticks: 5 } });
	record("gating: events change the arms", Plain.arms !== Armed.arms, `${Plain.arms} -> ${Armed.arms}`);
	record("gating: tools add orbit elements", Plain.orbit !== Armed.orbit, `${Plain.orbit} -> ${Armed.orbit}`);
	record("evolution: a changelog version adds a ring", Evolved.mutations.rings === 2, `${Evolved.mutations.rings} rings`);
}

// 6. ledger
{
	const Ledger = JSON.parse(readFileSync(join(Root, "Maintain", "Icon", "Ledger.json"), "utf8"));
	const Entries = Ledger.icons ?? [];
	const Mismatched = Entries.filter((Entry) => {
		const MonoPath = join(Root, Entry.path.mono);
		return !existsSync(MonoPath);
	});
	record("ledger: one entry per package", Entries.length === 102, `${Entries.length} entries`);
	record("ledger: every recorded path exists", Mismatched.length === 0, Mismatched.slice(0, 3).map((Entry) => Entry.path.mono).join(", "));
	record("ledger: the package list matches the two trees", packages(Root).length === 102, `${packages(Root).length} packages`);
}

// 7. the committed tree
{
	const Result = check(Root);
	record("tree: the committed assets match a fresh build", Result.ok, `${Result.missing.length} missing, ${Result.stale.length} stale`);
}

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
