// Source/Test/Parser/Test.ts - the strict YAML-subset parser: mappings,
// sequences, sequence-of-maps items, quoted and flow scalars, comments,
// document markers, the scalar types, the reader's .json path, and the
// constructs the parser REFUSES with a line-numbered error.
import assert from "node:assert/strict";

import { Check, Finish, Library, MakeCounter, Put, Tree } from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	Check(Count, "P1: a pack-shaped mapping/sequence tree parses", () => {
		const Text = `signature:
  - docs/STYLE.md
families:
  "doc/Plan":
    priority: 2
    threshold: 0.75
    signals:
      - rule: plan
        pattern: 'Documentation/Plans/.*\\.md$'
        weight: 2.5
    targets:
      - path: docs/STYLE.md
        kind: style
        prior: 1.0
        reason: the temp style
`;
		assert.deepEqual(Library.Parse(Text), {
			signature: ["docs/STYLE.md"],
			families: {
				"doc/Plan": {
					priority: 2,
					threshold: 0.75,
					signals: [
						{
							rule: "plan",
							pattern: "Documentation/Plans/.*\\.md$",
							weight: 2.5,
						},
					],
					targets: [
						{
							path: "docs/STYLE.md",
							kind: "style",
							prior: 1,
							reason: "the temp style",
						},
					],
				},
			},
		});
	});

	Check(Count, "P2: comments, blank lines and the document markers are dropped", () => {
		const Text = `---
# the pack
signature: [a, b] # inline

learning:
  propose: true # on
...
`;
		assert.deepEqual(Library.Parse(Text), {
			signature: ["a", "b"],
			learning: { propose: true },
		});
	});

	Check(Count, "P3: single, double and flow scalars", () => {
		const Text = `single: 'it''s'
double: "a\\tb"
flow: ["a", 'b']
empty: []
mapping: {}
`;
		assert.deepEqual(Library.Parse(Text), {
			single: "it's",
			double: "a\tb",
			flow: ["a", "b"],
			empty: [],
			mapping: {},
		});
	});

	Check(Count, "P4: booleans, null and numbers", () => {
		const Text = `a: true
b: false
c: null
d: ~
e: 1.5
f: -2
g: 01
h: plain text
`;
		assert.deepEqual(Library.Parse(Text), {
			a: true,
			b: false,
			c: null,
			d: null,
			e: 1.5,
			f: -2,
			g: "01",
			h: "plain text",
		});
	});

	Check(Count, "P5: the unsupported constructs throw a line-numbered error", () => {
		assert.throws(() => Library.Parse("a:\t1"), /tabs are not supported/);
		assert.throws(() => Library.Parse("a: &x 1"), /anchors are not supported/);
		assert.throws(() => Library.Parse("a: *x"), /aliases are not supported/);
		assert.throws(() => Library.Parse("a: !x 1"), /tags are not supported/);
		assert.throws(() => Library.Parse("a: |"), /block scalars are not supported/);
		assert.throws(() => Library.Parse("a: {b: c}"), /flow collections/);
		assert.throws(() => Library.Parse("a: 1\na: 2"), /duplicate key a/);
		assert.throws(() => Library.Parse("a: 1\n  b: 2"), /unexpected indentation/);
		assert.throws(() => Library.Parse("a: 'open"), /unterminated single-quoted/);
	});

	Check(Count, "P6: Read parses .yml and .json and refuses a non-mapping root", () => {
		const Root = Tree("pack-parser-");
		Put(Root, "pack.yml", "signature:\n  - docs/A.md\n");
		Put(Root, "pack.json", JSON.stringify({ signature: ["docs/B.md"] }));
		Put(Root, "array.yml", "- a\n- b\n");
		assert.deepEqual(Library.Read(`${Root}/pack.yml`), {
			signature: ["docs/A.md"],
		});
		assert.deepEqual(Library.Read(`${Root}/pack.json`), {
			signature: ["docs/B.md"],
		});
		assert.throws(() => Library.Read(`${Root}/array.yml`), /the root must be a mapping/);
	});

	return Finish(Count, "Parser");
};

// Standalone entry: `node Target/Test/Parser/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Parser`);
}
