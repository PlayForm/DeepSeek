// Source/Test/Gates/Test.ts - one singular test: the pinner's g1 gate set
// through the real wired listener - actor/kind/basename gates silent (no read,
// no write, no line), the exclusion-first `skipped (excluded)` line in
// byte-format with the file untouched, and the Stash idempotence gate silent
// and taking precedence over the excluded line.
// Runs standalone (`node Target/Test/Gates/Test.js`) AND under the aggregate
// (`Maintain/Run/Smokes/Index.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-pinner.
import assert from "node:assert/strict";
import * as Path from "node:path";
import {
	Boot,
	Check,
	Finish,
	Ledger,
	Lines,
	MakeCounter,
	Root,
	Settle,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const World = Boot();
	const { ctx, listener, st } = World;
	// Group: the g1 gate set (end-to-end through the real listener).
	const gatesDir = Path.join(Root, "gates");
	const before = { reads: ctx.reads.length, writes: ctx.writes.length };
	listener(
		{ targetKey: "g-actor", displayPath: Path.join(gatesDir, "package.json") },
		{ kind: "present", version: "v1" },
		{ name: "grep" },
	);
	listener(
		{ targetKey: "g-kind", displayPath: Path.join(gatesDir, "package.json") },
		{ kind: "absent", version: "v1" },
		{ name: "edit" },
	);
	listener(
		{ targetKey: "g-base", displayPath: Path.join(gatesDir, "Cargo.toml") },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await Settle(st);
	{
		const Sub = "gates: actor / kind / basename \u2014 no read, no write, no line";
		{
			Check(Count, Sub, () => {
				assert.equal(ctx.reads.length, before.reads, "non-trigger events: no read");
				assert.equal(ctx.writes.length, before.writes, "non-trigger events: no write");
				assert.equal(
					Lines(Ledger).filter((l) => l.includes("skipped")).length,
					0,
					"non-trigger events: no ledger line",
				);
			});
		}
	}
	const excludedPath = Path.join(gatesDir, "node_modules", "x", "package.json");
	listener(
		{ targetKey: "g-excl", displayPath: excludedPath },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await Settle(st);
	{
		const Sub = "gates: exclusion-first \u2192 skipped (excluded) line, file untouched";
		{
			Check(Count, Sub, () => {
				assert.equal(ctx.reads.length, before.reads, "excluded: no read");
				assert.ok(
					Lines(Ledger).some((l) =>
						/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] skipped \(excluded\) .*node_modules.*package\.json$/.test(
							l,
						),
					),
					"skipped (excluded) line byte-format",
				);
			});
		}
	}
	st.Stash.set("g-dup", "v1");
	const exclLinesBefore = Lines(Ledger).filter((l) => l.includes("skipped (excluded)")).length;
	listener(
		{ targetKey: "g-dup", displayPath: Path.join(gatesDir, "package.json") },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	const dupReads = ctx.reads.length;
	listener(
		{ targetKey: "g-dup", displayPath: Path.join(gatesDir, "node_modules", "y", "package.json") },
		{ kind: "present", version: "v1" },
		{ name: "edit" },
	);
	await Settle(st);
	{
		const Sub = "gates: Stash idempotence \u2014 silent re-emit, precedence over the excluded line";
		{
			Check(Count, Sub, () => {
				assert.equal(ctx.reads.length, dupReads, "idempotent re-emit \u2192 no read");
				assert.equal(
					Lines(Ledger).filter((l) => l.includes("skipped (excluded)")).length,
					exclLinesBefore,
					"idempotence precedes exclusion (the re-emit is silent even on an excluded path)",
				);
			});
		}
	}
	return Finish(Count, "Gates");
};

// Standalone entry: `node Target/Test/Gates/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Gates`);
}
