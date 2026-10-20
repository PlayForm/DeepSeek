// Source/Test/Update-Envelope/Test.ts - one singular test: the typed-effect
// Update envelope (the base's own additive surface) - the builders' export
// names, Settle's breaker/U2 flow, the three dispatch gates, the dispatched
// order (journal first, then the line), the never-rejecting done outcome, the
// contained bug-level rejection, the settling detached fallback and the
// forkIn interruption at dispose.
// Runs standalone (`node Target/Test/Update-Envelope/Test.js`) AND under the
// aggregate (`Maintain/Run-Smokes.mjs` spawns it).
// This folder is the ETS-only additive coverage re-homed from the ETS core
// smoke's sections 9 + 11; there is no Classic twin.
import assert from "node:assert/strict";
import { Check, CheckAsync, Finish, MakeCounter } from "../Harness.js";
import { Activate, Update } from "../../../Target/Library.js";
import type { Dependencies } from "../../../Target/Function/Update.js";
import { Effect, type Scope } from "effect";

// The module-side fake: injected State maps, factory delegates, the job hooks
// and the module's OWN ledger strings (the shape the governor/pinner/cargo
// modules supply; the strings here are the smoke's, not the core's). Typed
// against the envelope's exported Dependencies contract.
interface SmokeState {
	Count: Map<string, number>;
	Stamp: Map<string, number>;
	Set: Set<string>;
	Inflight: Map<string, { controller: AbortController }>;
	Journal: Array<[string, string, string]>;
	Ledger: string[];
	Refreshed: Array<[unknown, number]>;
	Specification: Parameters<Dependencies<SmokeState, unknown, number, null>["Start"]>[1] | null;
	Detached: unknown;
}
type SmokeDependencies = Dependencies<SmokeState, unknown, number, null>;

export const runTest = async (): Promise<number> => {
	const Count = MakeCounter();
	// Group: Activate + Update - the builders' shapes (same names, additive).
	{
		const Sub =
			"Activate + Update: the builders keep their export names (the composer + the effect builder)";
		{
			Check(Count, Sub, () => {
				assert.equal(
					Activate([
						["mode", "anywhere"],
						["exclude", undefined],
						["", "pinner flavor"],
					]),
					"activated (mode=anywhere, pinner flavor)",
					"Activate: the activation-line composer (skip-absent, bare segment)",
				);
				assert.equal(
					typeof Update,
					"function",
					"Update: the envelope builder is exported under the same name",
				);
			});
		}
	}
	// Group: Update - the typed-effect envelope (EffectTS additive).
	{
		const UpdateLines: SmokeDependencies["Lines"] = {
			Paused: (Dir, Count, Limit) =>
				`update stage paused for ${Dir} (consecutive=${Count}, limit=${Limit})`,
			InFlight: (Dir) => `update stage skipped for ${Dir} (in-flight)`,
			Cooldown: (Dir) => `update stage skipped for ${Dir} (cooldown)`,
			Failed: (Dir, Code, Consecutive) =>
				`update stage FAILED (${Code}) for ${Dir}; consecutive=${Consecutive}`,
			Dispatched: (_State, Dir, PolicyPath) =>
				`update stage dispatched for ${Dir} (mode=smoke, ncu via /bin/ncu, ${PolicyPath})`,
		};
		const UpdateState = (): SmokeState => ({
			Count: new Map(),
			Stamp: new Map(),
			Set: new Set(),
			Inflight: new Map(),
			Journal: [],
			Ledger: [],
			Refreshed: [],
			Specification: null,
			Detached: null,
		});
		const UpdateDeps = (Over: Partial<SmokeDependencies> = {}): SmokeDependencies => ({
			Count: (State) => State.Count,
			Stamp: (State) => State.Stamp,
			Set: (State) => State.Set,
			Inflight: (State) => State.Inflight,
			Limit: () => 2,
			Wait: () => 0,
			UpdateKey: (_State, Target) => `update:${Target}`,
			Append: (State, Message) => State.Ledger.push(Message),
			Journal: (State, Event, Dir, Detail) => State.Journal.push([Event, Dir, Detail]),
			Refresh: (State, Target, _Actor, Version) => State.Refreshed.push([Target, Version]),
			Stat: async () => ({ version: 7 }),
			Start: (State, Specification, Detached) => {
				State.Specification = Specification;
				State.Detached = Detached;
			},
			Lines: UpdateLines,
			DispatchedEvent: "dispatched",
			DispatchedDetail: () => "mode=smoke",
			FailedEvent: "update-failed",
			Kind: "governor-update",
			Label: (Dir) => `ncu ${Dir}`,
			RejectedDetail: "update stage rejected",
			Stage: async () => 0,
			...Over,
		});
		const RunScoped = <A>(EffectIn: Effect.Effect<A, never, Scope.Scope>) =>
			Effect.runPromise(Effect.scoped(EffectIn));
		// The Check label is the source suite's ok label, verbatim (the em
		// dash, the subscript 2 and the arrow are escaped for an ASCII source
		// file). The whole envelope scenario lives in the one Check because the
		// source suite counts section 11 as ONE ok group; each nested block
		// below is one branch of it.
		await CheckAsync(
			Count,
			"Update: the typed-effect envelope \u2014 Settle's breaker/U\u2082 flow, the three gates, the dispatched order (journal \u2192 line), the never-rejecting done outcome, the contained rejection, the settling detached fallback and the forkIn interruption at dispose",
			async () => {
				{
					// Branch: Settle - the breaker reset on 0, the failure line +
					// record otherwise, the U2 refresh in every case, the code
					// returned, never rejecting.
					const State = UpdateState();
					const Code = await Effect.runPromise(
						Update(UpdateDeps()).Settle(State, "/x", {}, undefined, 0),
					);
					assert.equal(Code, 0, "Settle returns the code it was given");
					assert.equal(State.Count.get("/x"), 0, "Settle resets the breaker on 0");
					assert.deepEqual(
						State.Refreshed,
						[[{}, 7]],
						"Settle runs U\u2082 (the stat's version to the module's Refresh)",
					);
					assert.equal(State.Ledger.length, 0, "Settle on 0: no failure line");
				}
				{
					const State = UpdateState();
					const Code = await Effect.runPromise(
						Update(UpdateDeps()).Settle(State, "/x", {}, undefined, 3),
					);
					assert.equal(Code, 3, "Settle returns a non-zero code");
					assert.equal(
						State.Count.get("/x"),
						1,
						"Settle increments the breaker on failure",
					);
					assert.deepEqual(
						State.Ledger,
						["update stage FAILED (3) for /x; consecutive=1"],
						"Settle appends the module's byte-identical failure line",
					);
					assert.deepEqual(
						State.Journal,
						[["update-failed", "/x", "3"]],
						"Settle journals the P5 failure record (event, dir, stringified code)",
					);
					assert.equal(
						State.Refreshed.length,
						1,
						"Settle still runs U\u2082 after a failure",
					);
				}
				{
					const State = UpdateState();
					const Code = await Effect.runPromise(
						Update(
							UpdateDeps({
								Stat: async () => {
									throw new Error("stat boom");
								},
							}),
						).Settle(State, "/x", {}, undefined, 5),
					);
					assert.equal(Code, 5, "a rejected stat is contained (U\u2082 best-effort)");
					assert.equal(State.Refreshed.length, 0, "no Refresh when the stat fails");
					assert.equal(State.Count.get("/x"), 1, "the breaker still increments");
				}
				{
					// Branch: Dispatch - the three gates (circuit breaker,
					// in-flight, cooldown), each logging its own line and
					// returning.
					const State = UpdateState();
					State.Count.set("/x", 2);
					await RunScoped(
						Update(UpdateDeps()).Dispatch(State, "/x/pkg", undefined, "/x", null, "/p"),
					);
					assert.deepEqual(
						State.Ledger,
						["update stage paused for /x (consecutive=2, limit=2)"],
						"the breaker gate: the paused line (the raw map read)",
					);
					assert.equal(State.Specification, null, "the breaker gate: no job started");
					assert.equal(
						State.Journal.length,
						0,
						"the breaker gate: no journal record",
					);
				}
				{
					const State = UpdateState();
					State.Set.add("/x");
					await RunScoped(
						Update(UpdateDeps()).Dispatch(State, "/x/pkg", undefined, "/x", null, "/p"),
					);
					assert.deepEqual(
						State.Ledger,
						["update stage skipped for /x (in-flight)"],
						"the in-flight gate: one update run per directory",
					);
					assert.equal(State.Specification, null, "the in-flight gate: no job started");
				}
				{
					const State = UpdateState();
					State.Stamp.set("/x", Date.now());
					await RunScoped(
						Update(UpdateDeps({ Wait: () => 60_000 })).Dispatch(
							State,
							"/x/pkg",
							undefined,
							"/x",
							null,
							"/p",
						),
					);
					assert.deepEqual(
						State.Ledger,
						["update stage skipped for /x (cooldown)"],
						"the cooldown gate",
					);
					assert.equal(State.Specification, null, "the cooldown gate: no job started");
				}
				{
					// Branch: Dispatch - the dispatched path - the P2 registration,
					// the jobs envelope (journal first, then the line), the
					// never-rejecting done outcome and the settlement.
					const State = UpdateState();
					await RunScoped(
						Update(UpdateDeps()).Dispatch(
							State,
							"/x/package.json",
							undefined,
							"/x",
							null,
							"/p/policy.json",
						),
					);
					assert.deepEqual(
						State.Journal,
						[["dispatched", "/x", "mode=smoke"]],
						"the dispatched journal record comes FIRST (the governor-family order)",
					);
					assert.match(
						State.Ledger[0] ?? "",
						/^update stage dispatched for \/x \(mode=smoke/,
						"the dispatched ledger line comes after the journal record",
					);
					const Specification = State.Specification!;
					assert.equal(Specification.kind, "governor-update", "the spec's producer kind");
					assert.equal(Specification.label, "ncu /x", "the spec's one-line label");
					assert.equal(
						State.Inflight.has("update:/x/package.json"),
						true,
						"the P2 registration under the namespaced key",
					);
					const Job = Specification.run({ append: () => {} });
					assert.equal(
						typeof Job.cancel,
						"function",
						"the job's cancel aborts the task-owned signal",
					);
					const Outcome = await Job.done;
					assert.deepEqual(
						Outcome,
						{ status: "completed", detail: "exit code: 0" },
						"the done outcome maps the exit code",
					);
					assert.equal(
						State.Set.has("/x"),
						false,
						"the settlement removed the in-flight marker",
					);
					assert.equal(
						State.Inflight.has("update:/x/package.json"),
						false,
						"the settlement removed the P2 registration",
					);
					assert.equal(State.Count.get("/x"), 0, "the settlement reset the breaker");
					assert.equal(State.Refreshed.length, 1, "the settlement ran U\u2082");
				}
				{
					// Branch: Dispatch - a bug-level Stage rejection still settles
					// the breaker and resolves `failed` with the module's rejected
					// detail (containment).
					const State = UpdateState();
					const BoomStage: SmokeDependencies["Stage"] = async (
						_State,
						_Dir,
						_Target,
						_Actor,
						_Registry,
						_PolicyPath,
						Signal,
					) => {
						await new Promise((Resolve, Reject) => {
							Signal.addEventListener("abort", () => Reject(new Error("aborted")));
							setTimeout(Resolve, 250);
						});
						return 0;
					};
					await RunScoped(
						Update(UpdateDeps({ Stage: BoomStage })).Dispatch(
							State,
							"/x/package.json",
							undefined,
							"/x",
							null,
							"/p",
						),
					);
					const Job = State.Specification!.run({ append: () => {} });
					Job.cancel();
					const Outcome = await Job.done;
					assert.deepEqual(
						Outcome,
						{ status: "failed", detail: "update stage rejected" },
						"a bug-level rejection resolves the failed outcome with the module's detail",
					);
					assert.equal(
						State.Set.has("/x"),
						false,
						"the containment removed the in-flight marker",
					);
					assert.equal(
						State.Inflight.has("update:/x/package.json"),
						false,
						"the containment removed the P2 registration",
					);
					assert.equal(
						State.Count.get("/x"),
						1,
						"the containment incremented the breaker",
					);
				}
				{
					// Branch: Dispatch - the detached fallback (no job registry) -
					// the same contained chain, forked ON THE PLUGIN SCOPE and
					// settled without any awaiter.
					const State = UpdateState();
					await RunScoped(
						Effect.gen(function* () {
							yield Update(
								UpdateDeps({ Start: (_State, _Specification, Detached) => Detached() }),
							).Dispatch(
								State,
								"/x/package.json",
								undefined,
								"/x",
								null,
								"/p/policy.json",
							);
							// the continuation fiber runs while the scope is open
							for (
								let Index = 0;
								Index < 200 && State.Refreshed.length === 0;
								Index++
							) {
								yield Effect.yieldNow;
							}
						}),
					);
					assert.equal(
						State.Set.has("/x"),
						false,
						"the detached chain settled (marker removed)",
					);
					assert.equal(
						State.Count.get("/x"),
						0,
						"the detached chain settled (breaker reset)",
					);
					assert.equal(State.Refreshed.length, 1, "the detached chain ran U\u2082");
					assert.equal(State.Journal.length, 1, "the detached chain's dispatch record");
				}
				{
					// Branch: Dispatch - the in-flight fiber is interrupted at
					// dispose (Effect.forkIn on the plugin scope) and the
					// interruption aborts the task-owned controller - the Classic
					// Inflight-disposal semantics.
					const State = UpdateState();
					const HangStage: SmokeDependencies["Stage"] = (
						_State,
						_Dir,
						_Target,
						_Actor,
						_Registry,
						_PolicyPath,
						Signal,
					) =>
						new Promise((Resolve) => {
							Signal.addEventListener("abort", () => Resolve(143));
						});
					await RunScoped(
						Effect.gen(function* () {
							yield Update(
								UpdateDeps({
									Stage: HangStage,
									Start: (_State, _Specification, Detached) => Detached(),
								}),
							).Dispatch(
								State,
								"/x/package.json",
								undefined,
								"/x",
								null,
								"/p/policy.json",
							);
							yield Effect.yieldNow;
							yield Effect.yieldNow;
						}),
					);
					const Registration = State.Inflight.get("update:/x/package.json");
					for (
						let Index = 0;
						Index < 100 && !(Registration && Registration.controller.signal.aborted);
						Index++
					) {
						await new Promise((Resolve) => setImmediate(Resolve));
					}
					assert.ok(
						Registration,
						"the interrupted fiber never settled (the P2 registration stands)",
					);
					assert.equal(
						Registration.controller.signal.aborted,
						true,
						"the scope's dispose interrupted the in-flight fiber and aborted its controller",
					);
				}
			},
		);
	}
	return Finish(Count, "Update-Envelope");
};

// Standalone entry: `node Target/Test/Update-Envelope/Test.js`.
const InvokedDirectly =
	process.argv[1] !== undefined &&
	import.meta.url === (await import("node:url")).pathToFileURL(process.argv[1]).href;
if (InvokedDirectly) {
	const Pass = await runTest();
	console.log(`${Pass} PASS - Update-Envelope`);
}
