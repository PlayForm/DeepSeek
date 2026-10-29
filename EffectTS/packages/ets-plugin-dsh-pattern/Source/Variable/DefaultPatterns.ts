// DefaultPatterns - the cold-start catalog (PATTERN-GRAPH-PLUGIN.md section
// 3: "the cold start is the static repo map plus the family's conventions,
// not an empty registry"). The shipped patterns are the conventions any
// repository of this family shares; confidence 0.5, not seeded by evidence.
// The learner's offline mining replaces these with session-derived patterns
// at the same ids (Put is idempotent by id).
import type Pattern from "@Interface/Pattern.js";

export default [
	{
		id: "version-bump",
		intent: "version-bump",
		trigger: { keywords: ["version", "bump", "release"] },
		targets: ["**/package.json", "**/Cargo.toml", "README.md", "CHANGELOG.md"],
		transform: ["bump version fields", "update pins", "update doc figures"],
		arbiter: "the aggregate build and the site build",
		confidence: 0.5,
		allowlist: true,
		updatedAt: 0,
	},
	{
		id: "search",
		intent: "search",
		trigger: { tool: "search", keywords: ["find", "where", "locate"] },
		targets: ["**/*.md", "**/*.ts"],
		transform: ["open these, then edit"],
		arbiter: "the eventual build/test",
		confidence: 0.5,
		allowlist: false,
		updatedAt: 0,
	},
	{
		id: "rename",
		intent: "rename",
		trigger: { keywords: ["rename", "move", "symbol"] },
		targets: ["**/*.ts", "**/*.md"],
		transform: ["rewrite the symbol", "update the tests", "update the docs"],
		arbiter: "the build and the smoke suite",
		confidence: 0.5,
		allowlist: false,
		updatedAt: 0,
	},
	{
		id: "test-update",
		intent: "test-update",
		trigger: { keywords: ["test", "smoke", "expect"] },
		targets: ["**/Source/Test/**", "Maintain/Run-Smokes.mjs"],
		transform: ["update the expectations", "keep the counts recorded"],
		arbiter: "the smoke aggregate",
		confidence: 0.5,
		allowlist: false,
		updatedAt: 0,
	},
] satisfies Pattern[];
