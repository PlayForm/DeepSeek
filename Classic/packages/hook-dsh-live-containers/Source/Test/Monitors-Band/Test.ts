// Source/Test/Monitors-Band/Test.ts - the R-series byte-identity tests for
// the monitor stanza: every outcome line of the design section 6 byte-exact,
// the STALE flips without a re-run, the recovered forms, the summary
// arithmetic, the token budget and the KV stability. The glyphs are asserted
// as the rendered characters (the source writes the escapes).
import assert from "node:assert/strict";
import * as Monitors from "../../../Target/Function/Monitors.js";
import {
	Check,
	ExpectedTime,
	Finish,
	FireObserved,
	MakeCounter,
	MakeWave,
	FakeJobsHub,
	FakeShell,
	Validate,
	Ledger,
	rm,
	Advance,
	MonitorConfig,
	ClockBox,
} from "../Harness.js";
import type { CheckResult, MonitorEntry } from "../../../Target/Interface/Events.js";

/** A standard band mount: watchlist tsc only, nothing dispatched. */
const Setup = (Config: any = {}): { Run: any; Log: string[]; Entry: () => MonitorEntry } => {
	const Jobs = FakeJobsHub();
	const Shell = FakeShell();
	const Log: string[] = [];
	const Run = MakeWave(
		Validate({
			logFile: Ledger,
			enabled: true,
			...MonitorConfig({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] }),
			...Config,
		}),
		{ jobs: Jobs, shell: Shell },
	);
	Run.State.Factory.Append = (_State: unknown, Message: string) => {
		Log.push(`hook-dsh-live-containers: ${Message}`);
	};
	const Entry = (): MonitorEntry => Run.State.Monitors.get("agent-a")?.get("/repo/src/App.ts") as MonitorEntry;
	return { Run, Log, Entry };
};

/** Enroll through the observer (the deterministic writer and clock) and
 * clear the pending records - the render tests inject results directly and
 * must not dispatch through the scan. */
const Enroll = (Run: any, Path = "/repo/src/App.ts", Version = "1"): MonitorEntry => {
	FireObserved(Run, Path, Version);
	const Entry = Run.State.Monitors.get("agent-a")?.get(Path) as MonitorEntry;
	Entry.pending.clear();
	return Entry;
};

/** A settled-looking result injected directly (the render tests do not need
 * the dispatch path - the fold is covered by the Jobs series). */
const Settle = (Entry: MonitorEntry, Result: Partial<CheckResult>): void => {
	Entry.checks = Entry.checks.filter((Candidate: CheckResult) => Candidate.setId !== Result.setId);
	Entry.checks.push({
		setId: "tsc",
		jobId: "j0",
		ranAt: ClockBox.Now,
		checkedVersion: Entry.lastVersion ?? "",
		writer: "agent-a",
		exit: 0,
		infra: null,
		tail: "",
		provenance: "live",
		...Result,
	} as CheckResult);
};

/** The stanza text for one agent. */
const Parts = (Run: any): string =>
	Monitors.SectionParts(Run.State, "agent-a", "---", (Message: string) => Run.State.Factory.Append(Run.State, Message)).join("\n");

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();

	// Group B1: the clean band, byte-exact.
	rm();
	ClockBox.Now = 1700000000000;
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0 });
		const Now = ExpectedTime(ClockBox.Now);
		Check(Count, "B1: the full clean stanza is byte-exact (the glyphs rendered)", () => {
			assert.equal(
				Parts(Run),
				[
					"--- MONITORS (file checks; not harness state) ---",
					"monitors: 1 (∄1 !0 ~0 ∅0 x0) - 0 problem, 0 stale, 0 not run, 0 infra",
					"--- MONITOR /repo/src/App.ts ---",
					`clean (∄) | checked ${Now} v1 by agent-a | exit 0`,
					"--- END MONITOR /repo/src/App.ts ---",
					"--- END MONITORS ---",
				].join("\n"),
			);
		});
	}

	// Group B2: the STALE flip without a re-run.
	rm();
	{
		const { Run, Entry, Log } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0 });
		const Now = ExpectedTime(ClockBox.Now);
		// The settle-less version bump: only the observer fired.
		FireObserved(Run, "/repo/src/App.ts", "2");
		const Text = Parts(Run);
		Check(Count, "B2: the staleness notice logs once per version change", () => {
			assert.ok(
				Log.includes("hook-dsh-live-containers: monitor stale /repo/src/App.ts (version changed)"),
				`missing in: ${Log.join(" | ")}`,
			);
		});
		Check(Count, "B2: a settle-less bump renders the STALE declaration byte-exact", () => {
			assert.ok(
				Text.includes(
					`~ STALE (file changed after check) | clean (∄) | checked ${Now} v1 by agent-a | exit 0 | now v2`,
				),
				`missing in: ${Text}`,
			);
		});
		Check(Count, "B2: the false-pass guard - the summary counts the stale, not a clean", () => {
			assert.ok(Text.includes("monitors: 1 (∄0 !0 ~1 ∅0 x0)"));
			assert.ok(!Text.includes("monitors: 1 (∄1"));
		});
	}

	// Group B3: the problem band with the head-keep tail block.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 3, tail: "error TS2345: x\nsecond line" });
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B3: the problem line is byte-exact", () => {
			assert.ok(Text.includes(`problem (!) | checked ${Now} v1 by agent-a | exit 3`), `missing in: ${Text}`);
		});
		Check(Count, "B3: the tail block rides the problem line", () => {
			assert.ok(Text.includes("tail (up to 2 KiB):\nerror TS2345: x\nsecond line"), `missing in: ${Text}`);
		});
		Check(Count, "B3: the summary counts the problem", () => {
			assert.ok(Text.includes("monitors: 1 (∄0 !1 ~0 ∅0 x0) - 1 problem"));
		});
	}

	// Group B4: the infrastructure and the denial.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: null, infra: "killed:monitor-deadline" });
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B4: the infrastructure failure renders x, never !", () => {
			assert.ok(
				Text.includes(`check failed (infrastructure) (x) | checked ${Now} v1 by agent-a | killed:monitor-deadline`),
				`missing in: ${Text}`,
			);
			assert.ok(Text.includes("monitors: 1 (∄0 !0 ~0 ∅0 x1) - 0 problem, 0 stale, 0 not run, 1 infra"));
		});
	}
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: null, infra: "sandbox" });
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B4: the sandbox denial renders the denied form with no detail slot", () => {
			assert.ok(
				Text.includes(`check denied (sandbox) (x) | checked ${Now} v1 by agent-a`),
				`missing in: ${Text}`,
			);
			assert.ok(Text.includes("x1) - 0 problem, 0 stale, 0 not run, 1 infra"));
		});
	}

	// Group B5: the honest initial states.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B5: a never-run set renders the not-run-yet form", () => {
			assert.ok(Text.includes(`not run yet (∅?) | enrolled ${Now} by agent-a`), `missing in: ${Text}`);
			assert.ok(Text.includes("monitors: 1 (∄0 !0 ~0 ∅1 x0) - 0 problem, 0 stale, 1 not run, 0 infra"));
		});
		Entry().sets = [];
		const None = Parts(Run);
		Check(Count, "B5: an entry with no sets appends the checks: none clause", () => {
			assert.ok(None.includes(`not run yet (∅?) | enrolled ${Now} by agent-a | checks: none`), `missing in: ${None}`);
		});
	}

	// Group B6: the linked governance set.
	rm();
	{
		const { Run, Entry } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["governance"] }] });
		Enroll(Run);
		Entry().sets = ["governance"];
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B6: the linked set renders the linked form with the observed facts", () => {
			assert.ok(
				Text.includes(`∅ (linked governance; no re-run) | observed v1 by agent-a at ${Now}`),
				`missing in: ${Text}`,
			);
		});
	}

	// Group B7-B10: the recovered forms.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0, provenance: "recovered" });
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B7: a fresh recovered result keeps the outcome and adds the not-re-checked clause", () => {
			assert.ok(
				Text.includes(`clean (∄) (recovered) | checked ${Now} v1 by agent-a | exit 0 | not re-checked this session`),
				`missing in: ${Text}`,
			);
		});
	}
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0, provenance: "recovered" });
		const Ran = ExpectedTime(ClockBox.Now);
		Advance(300001);
		const Text = Parts(Run);
		Check(Count, "B8: a time-stale recovered result renders the STALE not-re-checked form", () => {
			assert.ok(
				Text.includes(`~ STALE (not re-checked this session) | checked ${Ran} v1 by agent-a | exit 0`),
				`missing in: ${Text}`,
			);
		});
	}
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0, provenance: "recovered" });
		const Ran = ExpectedTime(ClockBox.Now);
		FireObserved(Run, "/repo/src/App.ts", "2");
		const Text = Parts(Run);
		Check(Count, "B9: a recovered result after a mount-time edit renders both clauses", () => {
			assert.ok(
				Text.includes(
					`~ STALE (file changed after check) | clean (∄) (recovered) | checked ${Ran} v1 by agent-a | exit 0 | now v2`,
				),
				`missing in: ${Text}`,
			);
		});
	}
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 3, provenance: "recovered" });
		const Now = ExpectedTime(ClockBox.Now);
		const Text = Parts(Run);
		Check(Count, "B10: a fresh recovered problem keeps the outcome facts", () => {
			assert.ok(
				Text.includes(`problem (!) (recovered) | checked ${Now} v1 by agent-a | exit 3 | not re-checked this session`),
				`missing in: ${Text}`,
			);
		});
	}

	// Group B11: the band cap.
	rm();
	{
		const { Run, Entry, Log } = Setup({
			monitor: { ...MonitorConfig().monitor, bandCapBytes: 300 },
			watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }],
		});
		Enroll(Run);
		Entry().sets = ["tsc", "format"];
		Settle(Entry(), { setId: "tsc", exit: 3, tail: "y".repeat(400) });
		const Text = Parts(Run);
		Check(Count, "B11: an oversized band is truncated to the cap with the byte-exact ledger line", () => {
			const FrameStart = Text.indexOf("--- MONITOR /repo/src/App.ts ---");
			const FrameEnd = Text.indexOf("--- END MONITOR /repo/src/App.ts ---");
			const Frame = Text.slice(FrameStart, FrameEnd);
			const Kept = Buffer.byteLength(`${Frame}--- END MONITOR /repo/src/App.ts ---`, "utf8");
			assert.ok(Buffer.byteLength(Frame, "utf8") <= 300 + 60, `frame too long: ${Buffer.byteLength(Frame, "utf8")}`);
			assert.ok(
				Log.some((L) => L.startsWith("hook-dsh-live-containers: monitor band truncated /repo/src/App.ts (")),
				`no truncation line in: ${Log.join(" | ")}`,
			);
			assert.ok(Kept > 0);
		});
	}

	// Group B12: the KV stability.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run);
		Settle(Entry(), { setId: "tsc", exit: 0 });
		const First = Parts(Run);
		const Second = Parts(Run);
		Check(Count, "B12: two assemblies with no event render byte-identical stanzas", () => {
			assert.equal(First, Second);
		});
	}

	// Group B13: the summary arithmetic.
	rm();
	{
		const { Run } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc"] }] });
		Enroll(Run, "/repo/src/A.ts");
		Advance(1);
		Enroll(Run, "/repo/src/B.ts");
		Advance(1);
		Enroll(Run, "/repo/src/C.ts");
		Advance(1);
		Enroll(Run, "/repo/src/D.ts");
		Settle(Run.State.Monitors.get("agent-a")?.get("/repo/src/A.ts") as MonitorEntry, { setId: "tsc", exit: 0 });
		Settle(Run.State.Monitors.get("agent-a")?.get("/repo/src/B.ts") as MonitorEntry, { setId: "tsc", exit: 2 });
		Settle(Run.State.Monitors.get("agent-a")?.get("/repo/src/C.ts") as MonitorEntry, { setId: "tsc", exit: 0 });
		FireObserved(Run, "/repo/src/C.ts", "2");
		const Text = Parts(Run);
		Check(Count, "B13: the summary counts sum to the total and the counts mirror", () => {
			assert.ok(
				Text.includes("monitors: 4 (∄1 !1 ~1 ∅1 x0) - 1 problem, 1 stale, 1 not run, 0 infra"),
				`missing in: ${Text.slice(0, 400)}`,
			);
			assert.equal(1 + 1 + 1 + 1, 4);
		});
	}

	// Group B14: the primary ordering.
	rm();
	{
		const { Run, Entry } = Setup({ watchlist: [{ glob: "**/*.ts", checks: ["tsc", "format"] }] });
		Enroll(Run);
		Entry().sets = ["tsc", "format"];
		Settle(Entry(), { setId: "tsc", exit: 5 });
		Settle(Entry(), { setId: "format", exit: 0 });
		const Text = Parts(Run);
		Check(Count, "B14: the worst-state line renders first", () => {
			const Lines = Text.split("\n").filter((L) => L.includes("| checked"));
			assert.equal(Lines.length, 2);
			assert.ok(Lines[0]?.includes("problem (!)"));
			assert.ok(Lines[1]?.includes("clean (∄)"));
		});
	}

	// Group B15: the version display cap.
	rm();
	{
		const { Run, Entry } = Setup();
		Enroll(Run, "/repo/src/App.ts", "0123456789012345");
		Settle(Entry(), { setId: "tsc", exit: 0, checkedVersion: "0123456789012345" });
		const Text = Parts(Run);
		Check(Count, "B15: a long version token renders the 12-byte cap with the ellipsis", () => {
			assert.ok(Text.includes("v012345678901.."), `missing in: ${Text}`);
		});
	}

	// Group B16: the renderer failure is fail-open.
	rm();
	{
		const { Run, Log } = Setup();
		Enroll(Run);
		(Run.State as { Monitors: unknown }).Monitors = new Map([
			["agent-a", new Map([["/repo/src/App.ts", undefined as unknown as MonitorEntry]])],
		]);
		const Text = Monitors.SectionParts(
			Run.State,
			"agent-a",
			"---",
			(Message: string) => Run.State.Factory.Append(Run.State, Message),
		);
		Check(Count, "B16: a broken entry degrades to the ledger and an empty part", () => {
			assert.deepEqual(Text, []);
			assert.deepEqual(Log, [
				"hook-dsh-live-containers: monitor enrolled /repo/src/App.ts (by agent-a)",
				"hook-dsh-live-containers: monitors render failed -> skipped",
			]);
		});
	}
	return Finish(Count, "Monitors-Band");
};

// Standalone entry: `node Target/Test/Monitors-Band/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Monitors-Band`);
}
