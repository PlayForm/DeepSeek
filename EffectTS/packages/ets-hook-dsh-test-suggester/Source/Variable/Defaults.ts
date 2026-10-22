// Defaults - the hook's EMBEDDED PATTERN PACK (a Variable: one constant).
// The plan's pack-as-data contract (SEARCH-SUGGESTER-PLUGIN.md §8.2), the
// test consumer's projection: the test intent(s), their signals, their
// target sets and their reasons. A new domain is a pack, not code; this
// file IS the pack. The regexes are sources here and compiled once at apply
// (Function/Apply) - the hot path never compiles one.
//
// The intents, priority-ordered (lower wins):
//
//   Suite  - "which suite proves it": a PASS/FAIL/error TS grep, a bash
//            error sweep, a read of a Test.ts -> the suite's Test.ts, the
//            suite README (the expected count), the aggregate runner, the
//            README badge.
//   Counts - "what is the current count": a PASS-count question -> the
//            README badge, SCHEME.md, the site content (the counts must
//            agree or the release fails).
import type Pack from "@Interface/Pack.js";

export default {
	pack: "test",
	version: 1,
	intents: [
		{
			id: "Suite",
			priority: 1,
			threshold: 0.6,
			signals: [
				{
					rule: "test-shape",
					pattern: "PASS|FAIL|error TS|assert|suite|checks run",
					weight: 0.5,
				},
				{
					rule: "path-shape",
					pattern: "Source/Test/|smokes/Test/|Test\\.ts",
					weight: 0.4,
				},
				{
					rule: "loop-shape",
					pattern: "Run-Smokes|selfcheck",
					weight: 0.3,
				},
			],
			targets: [
				{
					path: "Source/Test/<Suite>/Test.ts",
					reason: "the assertion body - the suite that proves it",
					prior: 1.0,
				},
				{
					path: "Source/Test/<Suite>/README.md",
					reason: "the expected count and the coverage notes",
					prior: 1.0,
				},
				{
					path: "Maintain/Run-Smokes.mjs",
					reason: "the aggregate runner - how the suites are invoked",
					prior: 0.6,
				},
				{
					path: "README.md",
					reason: "the badge count, which must match the suite",
					prior: 0.6,
				},
			],
			note: "one suite per folder: Test.ts asserts, README.md carries the count; Target/ is never edited.",
		},
		{
			id: "Counts",
			priority: 2,
			threshold: 0.5,
			signals: [
				{
					rule: "count-shape",
					pattern: "\\b[0-9]+ PASS\\b|expected count|PASS count|suite count",
					weight: 0.5,
				},
				{
					rule: "doc-shape",
					pattern: "badge|smoke report|totals",
					weight: 0.3,
				},
			],
			targets: [
				{
					path: "README.md",
					reason: "the per-package badge count",
					prior: 1.0,
				},
				{
					path: "SCHEME.md",
					reason: "the full scheme table with the counts",
					prior: 0.6,
				},
				{
					path: "Site/Source/Library/Content.ts",
					reason: "the site content counts, which must agree",
					prior: 0.6,
				},
			],
			note: "the counts must agree across README, SCHEME and the site, or the release fails.",
		},
	],
} satisfies Pack;
