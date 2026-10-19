// Source/Test/Pin-Pass-And-No-Ops/Test.ts - one singular test: the pin pass
// end to end - the range law across all four sections (strip ^/~/= one leading
// prefix, everything else untouched, the documented ^1.* edge, non-string
// values, the refusal domain preserved, the serialization), the guarded write
// with Stash pre-registration and the P₃ same-actor re-emit, the silent
// re-entrant no-op, the author's next guarded write at the fresh version, and
// the three no-op paths (already pinned, non-JSON, vanished) all
// silent-writes-none.
// Runs standalone (`node Target/Test/Pin-Pass-And-No-Ops/Test.js`) AND under
// the aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// Unit smoke of @playform/ets-hook-dsh-package-pinner.
import assert from "node:assert/strict";
import * as Path from "node:path";
import {
	Boot,
	Check,
	CheckAsync,
	Finish,
	Ledger,
	LedgerCount,
	LedgerHas,
	Lines,
	MakeCounter,
	Root,
	Settle,
	Write,
	token,
} from "../Harness.js";

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	const World = Boot();
	const { ctx, listener, st } = World;
	const actor = { name: "edit" };
	// Group: the pin pass - the range law across all four sections.
	const pinDir = Path.join(Root, "pin-basic");
	const pinPath = Path.join(pinDir, "package.json");
	const author = {
		name: "x",
		scripts: { build: "tsc" },
		dependencies: {
			caret: "^0.3.4",
			tilde: "~1.2.3",
			equals: "=2.0.0",
			static: "0.4.0",
			star: "*",
			empty: "",
			compare: ">=1.0.0",
			compound: "^1.0.0 || 2.0.0",
			workspace: "workspace:*",
			file: "file:../x",
			link: "link:../y",
			git: "git+https://example/x",
			alias: "npm:pkg@1.0.0",
			wildcard: "^1.*",
			nonstring: { nested: true },
		},
		devDependencies: { dev: "^2.0.0" },
		peerDependencies: { peer: "=3.0.0" },
		optionalDependencies: { optional: "~4.0.0" },
	};
	Write(pinPath, JSON.stringify(author));
	const v1 = token(pinPath);
	const target = { targetKey: "pin-basic", displayPath: pinPath };
	const writesBefore = ctx.writes.length;
	const readsBefore = ctx.reads.length;
	listener(target, { kind: "present", version: v1 }, actor);
	// The await-free assertion point (the source suite asserts it BEFORE the
	// settle); capture the count here for the check.
	const writesAtFire = ctx.writes.length;
	await Settle(st);
	const writeRecord = ctx.writes.at(-1);
	{
		const Sub = "the range law: strip ^/~/= one leading prefix, everything else untouched, all four sections";
		{
			Check(Count, Sub, () => {
				assert.equal(
					writesAtFire,
					writesBefore,
					"the listener is await-free: the write detaches (silence)",
				);
				assert.equal(writeRecord.path, pinPath, "the manifest was rewritten");
				assert.equal(ctx.reads.length, readsBefore + 1, "exactly one governed read");
				assert.equal(ctx.reads.at(-1)![0], pinPath, "readText got the target");
				assert.equal(ctx.reads.at(-1)![1], true, "the read carries the pass's abort signal");
				assert.deepEqual(
					writeRecord.intent,
					{ kind: "replaceIfVersion", version: v1 },
					"replaceIfVersion at the CURRENT (fresh-stat) version \u2014 equals the observed one in this unraced pass",
				);
				assert.equal(writeRecord.signal !== null, true, "the write carries the pass's abort signal");
				const pinned = JSON.parse(writeRecord.content);
				assert.equal(pinned.dependencies.caret, "0.3.4", "^ stripped");
				assert.equal(pinned.dependencies.tilde, "1.2.3", "~ stripped");
				assert.equal(pinned.dependencies.equals, "2.0.0", "= stripped");
				assert.equal(pinned.devDependencies.dev, "2.0.0", "^ stripped in devDependencies");
				assert.equal(pinned.peerDependencies.peer, "3.0.0", "= stripped in peerDependencies");
				assert.equal(pinned.optionalDependencies.optional, "4.0.0", "~ stripped in optionalDependencies");
				assert.equal(pinned.dependencies.static, "0.4.0", "static untouched");
				assert.equal(pinned.dependencies.star, "*", "wildcard without prefix untouched");
				assert.equal(pinned.dependencies.empty, "", "empty range untouched");
				assert.equal(pinned.dependencies.compare, ">=1.0.0", "comparison range untouched");
				assert.equal(pinned.dependencies.compound, "^1.0.0 || 2.0.0", "compound/space range untouched");
				assert.equal(pinned.dependencies.workspace, "workspace:*", "protocol untouched");
				assert.equal(pinned.dependencies.file, "file:../x", "file: untouched");
				assert.equal(pinned.dependencies.link, "link:../y", "link: untouched");
				assert.equal(pinned.dependencies.git, "git+https://example/x", "git+ untouched");
				assert.equal(pinned.dependencies.alias, "npm:pkg@1.0.0", "npm: alias untouched");
				assert.equal(pinned.dependencies.wildcard, "1.*", "documented edge: ^1.* \u2192 1.*");
				assert.deepEqual(pinned.dependencies.nonstring, { nested: true }, "non-string value untouched");
				assert.equal(pinned.name, "x", "refusal domain: name preserved");
				assert.deepEqual(pinned.scripts, { build: "tsc" }, "refusal domain: scripts preserved");
				assert.ok(
					writeRecord.content.endsWith("\n") && writeRecord.content.includes('\n  "name"'),
					"the trio's serialization: JSON.stringify(next, null, 2) + newline",
				);
			});
		}
	}
	const fresh1 = token(pinPath);
	{
		const Sub = "the pin pass: guarded write + Stash pre-registration + the P\u2083 same-actor re-emit";
		{
			Check(Count, Sub, () => {
				assert.equal(
					st.Stash.get("pin-basic"),
					fresh1,
					"the fresh version is pre-registered in the Stash",
				);
				assert.ok(
					LedgerHas(Ledger, `pinned ${pinPath} (7 versions)`),
					"pinned <path> (N versions) \u2014 byte-identical message (7: caret/tilde/equals/wildcard + dev/peer/optional)",
				);
				assert.equal(
					LedgerCount(Ledger, `pinned ${pinPath} (7 versions)`),
					1,
					"exactly one pinned line",
				);
				const reEmit = ctx.emitted.filter((e: any) => e[0] === "fs/observed").at(-1)!;
				assert.deepEqual(reEmit[1], target, "the P\u2083 re-emit carries the same target");
				assert.deepEqual(reEmit[2], { kind: "present", version: fresh1 }, "\u2026and the FRESH version");
				assert.equal(reEmit[3], actor, "\u2026with the SAME actor (same owner bucket)");
			});
		}
	}
	{
		// the re-emit re-enters the listener: an idempotence-gate no-op
		const quiet = {
			reads: ctx.reads.length,
			writes: ctx.writes.length,
			lines: Lines(Ledger).length,
		};
		listener(target, { kind: "present", version: fresh1 }, actor);
		await Settle(st);
		const Sub = "re-entrancy: the P\u2083 re-emit is a silent no-op (no rewrite loop)";
		{
			Check(Count, Sub, () => {
				assert.equal(ctx.reads.length, quiet.reads, "re-entrant pass: no read");
				assert.equal(ctx.writes.length, quiet.writes, "re-entrant pass: no write");
				assert.equal(Lines(Ledger).length, quiet.lines, "re-entrant pass: no ledger line");
			});
		}
	}
	{
		const Sub = "version coherence: the author's next guarded write succeeds at the fresh version";
		await CheckAsync(Count, Sub, async () => {
			await assert.doesNotReject(
				() =>
					ctx.fs.writeText(
						target,
						JSON.stringify({ name: "x", dependencies: { next: "^9.0.0" } }),
						{ kind: "replaceIfVersion", version: fresh1 },
						undefined,
						undefined,
					),
				"the observation-policy's record is refreshed \u2014 no stale-version leak",
			);
		});
	}
	// Group: the refusal guard's invariant + the no-op paths.
	{
		const noopDir = Path.join(Root, "noops");
		// already pinned \u2192 the designed no-op line, no write, no re-emit
		const pinnedPath = Write(
			Path.join(noopDir, "pinned", "package.json"),
			JSON.stringify({ name: "p", dependencies: { a: "1.0.0" } }),
		);
		listener(
			{ targetKey: "noop-pinned", displayPath: pinnedPath },
			{ kind: "present", version: token(pinnedPath) },
			actor,
		);
		await Settle(st);
		// non-JSON \u2192 the skip line, no write
		const badPath = Write(Path.join(noopDir, "bad", "package.json"), "{ nope");
		listener(
			{ targetKey: "noop-bad", displayPath: badPath },
			{ kind: "present", version: token(badPath) },
			actor,
		);
		await Settle(st);
		// vanished file (the read fails) \u2192 the same line, contained
		const ghost = {
			targetKey: "noop-ghost",
			displayPath: Path.join(noopDir, "ghost", "package.json"),
		};
		listener(ghost, { kind: "present", version: "v1" }, actor);
		await Settle(st);
		const Sub = "no-op paths: no changes to pin / observed non-JSON / vanished \u2014 all silent writes-none";
		{
			Check(Count, Sub, () => {
				assert.ok(LedgerHas(Ledger, `no changes to pin for ${pinnedPath}`), "the no-changes line");
				assert.equal(
					ctx.writes.filter((w: any) => w.path === pinnedPath).length,
					0,
					"no write on the no-op path",
				);
				assert.ok(
					LedgerHas(Ledger, `observed non-JSON package.json ${badPath} \u2014 skipped`),
					"the non-JSON line byte-format",
				);
				assert.equal(
					ctx.writes.filter((w: any) => w.path === badPath).length,
					0,
					"no write on the non-JSON path",
				);
				assert.ok(
					LedgerHas(Ledger, `observed non-JSON package.json ${ghost.displayPath} \u2014 skipped`),
					"a vanished file maps to the non-JSON skip",
				);
				assert.equal(
					ctx.writes.filter((w: any) => w.path === ghost.displayPath).length,
					0,
					"no write for a vanished file",
				);
				assert.equal(st.Inflight.size, 0, "Inflight cleaned after every no-op path");
			});
		}
	}
	return Finish(Count, "Pin-Pass-And-No-Ops");
};

// Standalone entry: `node Target/Test/Pin-Pass-And-No-Ops/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Pin-Pass-And-No-Ops`);
}
