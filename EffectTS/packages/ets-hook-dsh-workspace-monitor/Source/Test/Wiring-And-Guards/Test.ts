// Source/Test/Wiring-And-Guards/Test.ts - the loader contract, the wiring and
// the guard chain: the default object carries name/apply/Config/inject, the
// root-identity of the fs/observed registration, the cold-mount
// idle-forever posture with its byte-exact line, the activation proof line,
// the fail-loud validation, the exclusion / own-actor / include guards with
// their byte-exact lines, the malformed-event containment, and the purity
// invariants (zero writeText/readText calls, apply returns nothing).
import assert from "node:assert/strict";
import {
	Check,
	Finish,
	Fire,
	FireAbsent,
	FireMalformed,
	Ledger,
	LedgerWith,
	LinesWith,
	MakeCounter,
	Make,
	Plugin,
	rm,
	Validate,
} from "../Harness.js";

/** A standard enabled mount with overrides. */
const Setup = (Config: Record<string, unknown> = {}): any => {
	rm();
	return Make(Validate({ logFile: Ledger, enabled: true, ...Config }));
};

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group G1: the loader contract.
	{
		Check(Count, "G1: the default object carries exactly name/apply/Config/inject", () => {
			assert.equal(Plugin.name, "hook-dsh-workspace-monitor");
			assert.equal(typeof Plugin.apply, "function");
			assert.equal(typeof Plugin.Config, "function");
			assert.deepEqual(Plugin.inject, ["pluginFactory"]);
			assert.deepEqual(Object.keys(Plugin), ["name", "apply", "Config", "inject"]);
		});
	}

	// Group G2: the wiring and the activation proof.
	{
		const Run = Setup();
		Check(Count, "G2: apply returns NOTHING and exposes the state probe", () => {
			assert.equal(Run.Returned, undefined);
			assert.ok(Run.State !== undefined);
			assert.equal(Run.State.Module, "monitor");
			assert.equal(Run.State.Enabled, true);
			assert.equal(Run.State.DomainName, "workspace_monitor");
		});
		Check(Count, "G2: the fs/observed listener is registered on the ROOT only", () => {
			assert.deepEqual(Run.RootNames, ["fs/observed"]);
			assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update"]);
		});
		Check(
			Count,
			"G2: the activation line is byte-exact (logger and durable file)",
			() => {
				assert.deepEqual(Run.Lines, [
					"monitor: activated (domain=workspace_monitor, checksets=4)",
				]);
				const Durable = LedgerWith("activated (domain=workspace_monitor, checksets=4)");
				assert.equal(Durable.length, 1);
				assert.match(Durable[0] as string, /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] /);
			},
		);
	}

	// Group G3: the cold-mount idle-forever posture.
	{
		const Run = Make(Validate({ logFile: Ledger, enabled: false }));
		Check(Count, "G3: a disabled mount wires NOTHING and logs the honest line", () => {
			assert.deepEqual(Run.RootNames, []);
			assert.deepEqual(Object.keys(Run.CtxListeners), ["loader/volatile-update"]);
			assert.deepEqual(Run.Lines, ["monitor: disabled (enabled=false)"]);
		});
	}

	// Group G4: the fail-loud validation.
	{
		Check(Count, "G4: a bad domain fails loud with the module-prefixed error", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, domain: "" })),
				/monitor: domain must be a non-empty string/,
			);
		});
		Check(Count, "G4: a bad maxWatch fails loud", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, maxWatch: 0 })),
				/monitor: maxWatch must be an integer >= 1/,
			);
		});
		Check(Count, "G4: a non-array include fails loud", () => {
			assert.throws(
				() => Make(Validate({ logFile: Ledger, enabled: true, include: "x" })),
				/include/,
			);
		});
	}

	// Group G5: the guard chain. NOTE: the monitor's exclusion match is the
	// factory's LITERAL segment match (a list entry matches a path segment
	// by name), so the fixtures use plain segment names.
	{
		const Run = Setup({ exclude: ["node_modules", "Target"] });
		Fire(Run, "/repo/Target/out/x.ts", "1");
		Check(Count, "G5: an excluded segment is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"monitor: ignored /repo/Target/out/x.ts (excluded)",
			]);
			const Durable = LedgerWith("ignored /repo/Target/out/x.ts (excluded)");
			assert.equal(Durable.length, 1);
			assert.ok((Durable[0] as string).endsWith(" ignored /repo/Target/out/x.ts (excluded)"));
			assert.equal(Run.State.Watch.size, 0);
			assert.equal(Run.State.Events, 0);
		});
		Check(Count, "G5: the other list entry excludes its segment too", () => {
			Fire(Run, "/repo/node_modules/pkg/index.js", "1");
			assert.ok(LinesWith(Run, "(excluded)").length === 2);
		});
	}

	{
		const Run = Setup();
		Fire(Run, "/repo/src/a.ts", "1", Run.State.Self);
		Check(Count, "G5: an own-actor event is ignored with the byte-exact line", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"monitor: ignored /repo/src/a.ts (own actor)",
			]);
			assert.equal(Run.State.Watch.size, 0);
		});
	}

	{
		const Run = Setup({ include: ["src"] });
		Fire(Run, "/repo/docs/readme.md", "1");
		Check(Count, "G5: a non-matching path under a non-empty include is ignored", () => {
			assert.deepEqual(LinesWith(Run, "ignored"), [
				"monitor: ignored /repo/docs/readme.md (not included)",
			]);
			assert.equal(Run.State.Watch.size, 0);
		});
		Check(Count, "G5: a matching path under the same include records normally", () => {
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.State.Watch.size, 1);
			assert.equal(Run.State.Events, 1);
		});
	}

	// Group G6: the watch recorder's record shape.
	{
		const Run = Setup({ debounceMs: 100000 });
		Fire(Run, "/repo/src/a.ts", "1");
		Check(Count, "G6: a present observation records the version verbatim", () => {
			const Entry = Run.State.Watch.get("/repo/src/a.ts");
			assert.equal(Entry.version, "1");
			assert.deepEqual(Entry.sets, ["tsc", "format"]);
			assert.equal(Entry.versions, 1);
			assert.equal(Entry.sweeps, 0);
			assert.equal(Entry.lastSweepAt, undefined);
			assert.equal(Entry.nextSweepAt, Entry.lastEventAt + 100000);
		});
		Check(Count, "G6: the watch line is byte-exact with the check-set list", () => {
			assert.deepEqual(LinesWith(Run, "watch"), [
				"monitor: watch /repo/src/a.ts version 1 (tsc,format)",
			]);
		});
		Check(Count, "G6: a repeated same-version event does not bump versions", () => {
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.State.Watch.get("/repo/src/a.ts").versions, 1);
			assert.equal(Run.State.Events, 2);
		});
		Check(Count, "G6: a version change bumps versions", () => {
			Fire(Run, "/repo/src/a.ts", "2");
			assert.equal(Run.State.Watch.get("/repo/src/a.ts").versions, 2);
		});
	}

	{
		const Run = Setup({ debounceMs: 100000 });
		FireAbsent(Run, "/repo/src/b.ts");
		Check(Count, "G6: an absent observation records version absent (never fabricated)", () => {
			assert.equal(Run.State.Watch.get("/repo/src/b.ts").version, "absent");
			assert.deepEqual(LinesWith(Run, "watch"), [
				"monitor: watch /repo/src/b.ts version absent (tsc,format)",
			]);
		});
	}

	{
		const Run = Setup({ debounceMs: 100000 });
		Fire(Run, "/repo/crates/x/Cargo.toml", "1");
		Fire(Run, "/repo/package.json", "1");
		Check(Count, "G6: the shipped catalog classifies cargo and governance too", () => {
			assert.deepEqual(LinesWith(Run, "Cargo.toml"), [
				"monitor: watch /repo/crates/x/Cargo.toml version 1 (cargo)",
			]);
			assert.deepEqual(LinesWith(Run, "package.json"), [
				"monitor: watch /repo/package.json version 1 (governance)",
			]);
		});
	}

	// Group G7: the malformed event.
	{
		const Run = Setup();
		FireMalformed(Run);
		Check(Count, "G7: a malformed event never throws and is ledgered as failed", () => {
			assert.deepEqual(LinesWith(Run, "failed"), [
				"monitor: failed unknown (malformed event: displayPath is not a string)",
			]);
			assert.equal(Run.State.Watch.size, 0);
		});
		Check(Count, "G7: the listener keeps working after the failure", () => {
			Fire(Run, "/repo/src/a.ts", "1");
			assert.equal(Run.State.Events, 1);
		});
	}

	// Group G8: the purity invariants.
	{
		const Run = Setup();
		Fire(Run, "/repo/src/a.ts", "1");
		FireMalformed(Run);
		Check(Count, "G8: the monitor never touches file content", () => {
			assert.equal(Run.Fs.writes.length, 0);
			assert.equal(Run.Fs.reads.length, 0);
			assert.equal(Run.Fs.resolved.length, 0);
		});
	}
	return Finish(Count, "Wiring-And-Guards");
};

// Standalone entry: `node Target/Test/Wiring-And-Guards/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Wiring-And-Guards`);
}
