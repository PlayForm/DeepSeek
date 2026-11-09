/**
 * @module Test
 *
 * The session-history fold and its consumers against PURE in-memory fixtures (no filesystem,
 * no temporary trees): the Touch fold over event objects, the Adjacent co-touch ranking over
 * a folded sequence, the Root walk over REAL temporary directories, and the `builtin: false`
 * opt-out on Resolve.
 *
 * @remarks
 * The Root and Resolve scenarios are the only ones that touch the disk, and they use a
 * temporary home (never the real `~/.dsh`).
 */
import assert from "node:assert/strict";
import { join } from "node:path";

import { Check, Finish, Library, MakeCounter, Put, Tree } from "../Harness.js";

/** One Touch row, spelled out (the fixtures are the folded history). */
const Call = (Seq: number, Path: string, Tool = "Write"): Library.Touch => ({
	seq: Seq,
	path: Path,
	tool: Tool,
});

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// A1: the fold - what becomes a Touch and what does not.
	{
		Check(Count, "A1: the fold ignores every event that is not a tool/call", () => {
			assert.equal(Library.Fold({ type: "text" }, 0), undefined);
			assert.equal(Library.Fold({}, 1), undefined);
		});
		Check(Count, "A1: the fold parses a JSON string payload", () => {
			assert.deepEqual(
				Library.Fold(
					{ type: "tool/call", name: "Edit", arguments: '{"file_path":"docs/STYLE.md"}' },
					3,
				),
				{ seq: 3, path: "docs/STYLE.md", tool: "Edit" },
			);
		});
		Check(Count, "A1: the fold accepts an object payload and prefers file_path", () => {
			assert.deepEqual(
				Library.Fold(
					{
						type: "tool/call",
						name: "Read",
						arguments: { file_path: "a.md", path: "b.md" },
					},
					4,
				),
				{ seq: 4, path: "a.md", tool: "Read" },
			);
		});
		Check(Count, "A1: the fold falls back to path and filePath", () => {
			assert.deepEqual(Library.Fold({ type: "tool/call", arguments: { path: "b.md" } }, 5), {
				seq: 5,
				path: "b.md",
				tool: "",
			});
			assert.deepEqual(
				Library.Fold({ type: "tool/call", arguments: { filePath: "c.md" } }, 6),
				{ seq: 6, path: "c.md", tool: "" },
			);
		});
		Check(Count, "A1: the fold normalizes backslashes and strips the leading ./", () => {
			assert.equal(
				Library.Fold({ type: "tool/call", arguments: { file_path: ".\\docs\\A.md" } }, 7)
					?.path,
				"docs/A.md",
			);
			assert.equal(
				Library.Fold({ type: "tool/call", arguments: { file_path: "./docs/B.md" } }, 8)
					?.path,
				"docs/B.md",
			);
		});
		Check(Count, "A1: the fold skips malformed JSON and path-less arguments", () => {
			assert.equal(Library.Fold({ type: "tool/call", arguments: "{no" }, 9), undefined);
			assert.equal(Library.Fold({ type: "tool/call", arguments: "42" }, 10), undefined);
			assert.equal(Library.Fold({ type: "tool/call", arguments: {} }, 11), undefined);
			assert.equal(
				Library.Fold({ type: "tool/call", arguments: { file_path: "" } }, 12),
				undefined,
			);
		});
	}

	// A2: the Adjacent ranking over a folded sequence.
	{
		// a twice, each time followed by b; c, d and e follow one a once.
		const Touches = [
			Call(0, "docs/A.md"),
			Call(1, "docs/B.md"),
			Call(2, "docs/A.md"),
			Call(3, "docs/B.md"),
			Call(4, "docs/A.md"),
			Call(5, "docs/C.md"),
			Call(6, "docs/D.md"),
			Call(7, "docs/E.md"),
		];
		Check(Count, "A2: a repeated co-touch outranks a single one", () => {
			const Rows = Library.Adjacent(Touches, "docs/A.md");
			assert.equal(Rows[0]?.path, "docs/B.md");
			assert.equal(Rows[0]?.count, 3);
		});
		Check(Count, "A2: the score prefers the near neighbour over the far one", () => {
			const Rows = Library.Adjacent(Touches, "docs/A.md");
			assert.equal(Rows[1]?.path, "docs/C.md");
			assert.ok(Math.abs((Rows[1]?.score ?? 0) - 11 / 12) < 1e-9);
			assert.ok(Math.abs((Rows[2]?.score ?? 0) - 71 / 105) < 1e-9);
		});
		Check(Count, "A2: the anchor itself is never a candidate", () => {
			const Rows = Library.Adjacent(Touches, "docs/A.md");
			assert.equal(
				Rows.some((Row) => Row.path === "docs/A.md"),
				false,
			);
			assert.deepEqual(Rows.map((Row) => Row.path).sort(), [
				"docs/B.md",
				"docs/C.md",
				"docs/D.md",
				"docs/E.md",
			]);
		});
		Check(Count, "A2: the window bounds how far a co-touch carries", () => {
			const Far = [
				Call(0, "docs/A.md"),
				...Array.from({ length: 9 }, (_, Index) => Call(Index + 1, `docs/F${Index}.md`)),
			];
			assert.deepEqual(
				Library.Adjacent(Far, "docs/A.md", { window: 8, limit: 8 }).map((Row) => Row.path),
				[
					"docs/F0.md",
					"docs/F1.md",
					"docs/F2.md",
					"docs/F3.md",
					"docs/F4.md",
					"docs/F5.md",
					"docs/F6.md",
					"docs/F7.md",
				],
			);
			assert.deepEqual(
				Library.Adjacent(Far, "docs/A.md", { window: 2 }).map((Row) => Row.path),
				["docs/F0.md", "docs/F1.md"],
			);
		});
		Check(Count, "A2: the limit slices the ranked candidates", () => {
			const Far = [
				Call(0, "docs/A.md"),
				...Array.from({ length: 9 }, (_, Index) => Call(Index + 1, `docs/F${Index}.md`)),
			];
			assert.equal(Library.Adjacent(Far, "docs/A.md").length, 7);
			assert.equal(Library.Adjacent(Far, "docs/A.md", { limit: 3 }).length, 3);
		});
		Check(Count, "A2: an anchor that never appears folds to no candidates", () => {
			assert.deepEqual(Library.Adjacent(Touches, "docs/Z.md"), []);
		});
	}

	// A3: the Root walk over REAL temporary directories.
	{
		const Repo = Tree("pack-adjacent-root-");
		Put(Repo, "package.json");
		Put(Repo, "src/deep/File.ts");
		Check(Count, "A3: a directory with package.json is the root", () => {
			assert.equal(Library.Root(join(Repo, "src/deep/File.ts")), Repo);
		});
		const Outer = Tree("pack-adjacent-outer-");
		Put(Outer, ".git/HEAD");
		Put(Outer, "packages/inner/src/File.ts");
		Check(Count, "A3: the walk climbs past bare directories to the repo", () => {
			assert.equal(Library.Root(join(Outer, "packages/inner/src/File.ts")), Outer);
		});
		const Home = Tree("pack-adjacent-home-");
		const CwdRepo = Tree("pack-adjacent-cwd-repo-");
		Put(CwdRepo, "package.json");
		Check(
			Count,
			"A3: an empty path starts at the cwd and a markerless walk returns undefined",
			() => {
				assert.equal(Library.Root("", CwdRepo), CwdRepo);
				assert.equal(Library.Root("", Home), undefined);
			},
		);
	}

	// A4: the `builtin: false` opt-out on the layered resolution.
	{
		const Home = Tree("pack-adjacent-home-");
		const Bare = Tree("pack-adjacent-bare-");
		Check(Count, "A4: builtin false resolves a layer-less workspace to undefined", () => {
			assert.equal(Library.Resolve(Bare, { home: Home, builtin: false }), undefined);
			assert.equal(Library.Resolve(Bare, { home: Home }), Library.Builtin);
		});
		const Layered = Tree("pack-adjacent-layered-");
		Put(Layered, ".dsh/pack.yml", `signature:\n  - docs/STYLE.md\nslug: custom\n`);
		Put(Layered, "docs/STYLE.md");
		Check(Count, "A4: builtin false still resolves the layer that exists", () => {
			const Pack = Library.Resolve(Layered, { home: Home, builtin: false });
			assert.notEqual(Pack, undefined);
			assert.deepEqual(Pack?.signature, ["docs/STYLE.md"]);
			assert.equal(Pack?.slug, "custom");
		});
	}

	return Finish(Count, "Adjacent");
};

// Standalone entry: `node Target/Test/Adjacent/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Adjacent`);
}
