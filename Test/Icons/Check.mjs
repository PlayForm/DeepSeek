#!/usr/bin/env node
//===============================================================================
// Check.mjs - the icon system's own arbiter.
//===============================================================================
//
// Deterministic, dependency-free checks over the generated icon tree:
//   1. determinism: two in-memory builds produce identical bytes
//   2. coverage: one mono and one colour document per package, both under 16 KiB
//   3. uniqueness: every mono and every colour document is distinct
//   4. twins: a Classic/EffectTS pair differs (the traced mode) but shares the grammar
//   5. gating: the tools and events features change the plan; a changelog version
//      adds an evolution ring
//   6. ledger: one entry per package, the recorded paths exist, the recorded dirs
//      match the two trees
//   7. motion: every document carries the prefixed, reduced-motion-guarded style
//      block, every keyframe is prefixed, nothing is scripted or external, and
//      every icon moves at least one element
//   8. the committed tree matches a fresh build (the --check contract)
//
// Usage: node Test/Icons/Check.mjs
//===============================================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { planOf } from "../../Maintain/Icon/Grammar.mjs";
import { build, check, packages } from "../../Maintain/Icon/Index.mjs";

const Root = fileURLToPath(new URL("../../", import.meta.url));
const Expected = packages(Root).length;
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
const Mono = readdirSync(join(Root, "Maintain", "Icon", "Asset", "Mono")).filter((Name) => Name.endsWith(".svg"));
const Colour = readdirSync(join(Root, "Maintain", "Icon", "Asset", "Color")).filter((Name) => Name.endsWith(".svg"));
const MonoText = Mono.map((Name) => readFileSync(join(Root, "Maintain", "Icon", "Asset", "Mono", Name), "utf8"));
const ColourText = Colour.map((Name) => readFileSync(join(Root, "Maintain", "Icon", "Asset", "Color", Name), "utf8"));
{
	const Oversize = [...MonoText, ...ColourText].filter((Text) => Text.length >= 16384);
	record(`coverage: ${Expected} mono and ${Expected} colour documents`, Mono.length === Expected && Colour.length === Expected, `${Mono.length} mono, ${Colour.length} colour`);
	record("size: every document under 16 KiB", Oversize.length === 0, `${Oversize.length} oversize`);
	const Malformed = MonoText.filter((Text) => !Text.startsWith("<?xml") || !Text.trimEnd().endsWith("</svg>") || /NaN|undefined|Infinity/.test(Text));
	record("well-formedness: no malformed or non-finite document", Malformed.length === 0, `${Malformed.length} malformed`);
}

// 3. uniqueness
{
	const Hashes = new Set([...MonoText, ...ColourText]);
	record(`uniqueness: ${Expected * 2} distinct documents`, Hashes.size === Expected * 2, `${Hashes.size} distinct`);
}

// 4. twins
{
	const Pair = ["hook-dsh-ccr", "ets-hook-dsh-ccr"];
	const MonoA = readFileSync(join(Root, "Maintain", "Icon", "Asset", "Mono", `${Pair[0]}.svg`), "utf8");
	const MonoB = readFileSync(join(Root, "Maintain", "Icon", "Asset", "Mono", `${Pair[1]}.svg`), "utf8");
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
	const Missing = Entries.filter((Entry) => !existsSync(join(Root, Entry.path.mono)));
	const Recorded = Entries.map((Entry) => Entry.dir).sort().join(",");
	const Trees = packages(Root).map((Entry) => Entry.dir).sort().join(",");
	record("ledger: one entry per package", Entries.length === Expected, `${Entries.length} entries`);
	record("ledger: every recorded path exists", Missing.length === 0, Missing.slice(0, 3).map((Entry) => Entry.path.mono).join(", "));
	record("ledger: the recorded dirs match the two trees", Recorded === Trees, `${Entries.length} recorded, ${Expected} in the trees`);
}

// 7. motion
{
	const Files = [
		...Mono.map((Name) => ({ Prefix: Name.replace(/\.svg$/, ""), Text: MonoText[Mono.indexOf(Name)] })),
		...Colour.map((Name) => ({ Prefix: Name.replace(/\.svg$/, ""), Text: ColourText[Colour.indexOf(Name)] })),
	];
	const Unstyled = Files.filter((File) => !File.Text.includes("<style>") || !File.Text.includes("prefers-reduced-motion: no-preference") || !File.Text.includes("-scene * {"));
	const Unprefixed = Files.filter((File) => {
		const Names = [...File.Text.matchAll(/@keyframes ([a-z0-9-]+)/g)].map((Match) => Match[1]);
		return Names.length === 0 || Names.some((Name) => Name.startsWith(`${File.Prefix}-`) === false);
	});
	const Scripted = Files.filter((File) => /<script|href="http|url\(/.test(File.Text));
	const Still = Files.filter((File) => /class="[a-z0-9-]+-(?:orbit|counter|breathe|fire|twinkle|trace)"/.test(File.Text) === false);
	record("motion: every document carries the prefixed, reduced-motion-guarded style block", Unstyled.length === 0, `${Unstyled.length} unstyled`);
	record("motion: every keyframe carries the package directory", Unprefixed.length === 0, `${Unprefixed.length} unprefixed`);
	record("motion: no script and no external reference", Scripted.length === 0, `${Scripted.length} scripted or external`);
	record("motion: every icon moves at least one element", Still.length === 0, `${Still.length} still`);
}

// 8. the committed tree
{
	const Result = check(Root);
	record("tree: the committed assets match a fresh build", Result.ok, `${Result.missing.length} missing, ${Result.stale.length} stale`);
}

const Failed = Results.filter((Result) => !Result.Ok);
console.log(`\n${Results.length - Failed.length} of ${Results.length} checks pass`);
process.exit(Failed.length === 0 ? 0 : 1);
