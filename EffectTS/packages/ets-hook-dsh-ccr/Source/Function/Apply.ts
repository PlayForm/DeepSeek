// Apply - the plugin entry function, a THIN MODULE WIRE-UP in the factory
// family's shape: build the State through `Factory.State` (the cell unwrap,
// the shared mappings Ledger←logFile / Enabled←log and the module's own
// fields via the setup `fields` map - factory SCHEME.md §2.10), emit the
// durable activation proof (the module's own string, via Factory.Append -
// the factory never owns ledger strings), build the store, register the CCR
// hook's OWN tools/post-execute listener, and register the `ccr_retrieve`
// TOOL (the one retrieval relay; Aphrodite's 13 relays become 1).
//
// THE WATERFALL DISCIPLINE (verified against the harness pipeline docs and
// the production spill-policy precedent, a live tools/post-execute
// result-rewriter):
//   * `next()` is ALWAYS awaited FIRST, before any decision - omitting it
//     would short-circuit the downstream post-execute listeners;
//   * pass-through is `return decision` - the decision as the downstream
//     listeners shaped it, byte-identical;
//   * a decision is replaced only when it is an `accept` WITHOUT a `value`
//     (`Object.hasOwn(decision, "value")` - a value-carrying decision is
//     canonical; its content is a derived projection and cannot be replaced,
//     the PostToolDecision union's `content?: never`);
//   * the content basis is `decision.content ?? result.content` - what the
//     downstream listeners already shaped, or the raw result;
//   * FAIL-OPEN: the whole transform is one try/catch - on any error a
//     `logger.warn` records it and the downstream decision is returned
//     UNCHANGED. Never throw into the waterfall: a thrown listener would
//     turn a good tool result into a pipeline failure;
//   * `{ prepend: true }` - the CCR gate runs before the other post-execute
//     listeners (the spill-policy's posture: a compression policy wants the
//     pristine result, not a downstream one);
//   * `exec.signal` is not observed by an extra await: the listener's own
//     work is synchronous (classify, hash, map ops, the ledger append) - the
//     only await is `next()` itself.
//
// THE CONTEXT ENGINE (phase 4, config `contextEngine`, OFF by default):
// when the flag is on, the engine runtime is built (Function/Engine for the
// decision math and the documented limitations), the post-execute listener
// OBSERVES every result (its content for a pass-through, its hash for an
// already-stored one), and ONE `agent/pre-step` waterfall listener runs the
// archive decision at each step boundary - pushing the archived content
// through the EXISTING compress path (the same gate with the threshold
// opened, the same store, the same evictions) and emitting
// `ccr: engine archived <n> results`. When the flag is off, NO pre-step
// listener is registered and nothing is observed: the engine is fully
// inert (the smoke asserts the inertness).
//
// NOT factory machinery, deliberately:
//   * Factory.Wire is fs/observed-hardwired (the family's SILENCE) - the CCR
//     hook registers its own plain `ctx.on("tools/post-execute", ...)`,
//     fiber-owned, removed on unload, no manual bookkeeping;
//   * Factory.Attach has no consumer here: no jobs, no inflight
//     continuations, no storage-domain journal traffic (the compression
//     store is the plugin's OWN LRU, not the factory's lifecycle journal);
//     the activation record still reaches the shared domain best-effort via
//     Factory.Journal like every module's lifecycle line.
//   * Factory.Schema is not used for Config: the module owns its schema
//     (Variable/Config.ts, the plan §5 verbatim).
//
// The function returns NOTHING - never a value: the loader treats apply
// return values specially, and a returned State object silently killed event
// delivery (live-verified, plugin-development skill pitfall 16). Test probes
// read the state through the `ctx.__ccrState` attachment instead.
//
// `inject: ["pluginFactory", "tools"]` (Library.ts) - the factory is a
// REQUIRED service (the State builder + the ledger); the loader's PENDING
// state handles the ordering, so bundle-layer order never matters. `tools`
// serves the ccr_retrieve registration (ToolRuntime.register). Nothing else:
// the ledger append is the factory's own plain-fs exemption, and the store's
// optional journal is the store's own plain-fs exemption (Function/Store).
import { Activate } from "@playform/ets-base-dsh";
import Compress from "./Compress.js";
import { Decide } from "./Engine.js";
import Marker from "./Marker.js";
import Retrieve from "./Retrieve.js";
import Store from "./Store.js";
import type { Eviction } from "./Store.js";
import type { Verdict } from "./Compress.js";
import type { EngineRecord, EngineRuntime } from "./Engine.js";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";
import type Config from "@Interface/Config.js";
import type State from "@Interface/State.js";
import type { Context } from "@deepseek-ai/cordis";

// The bundle version, mirrored from package.json (the activation proof's
// first field; a release bumps both together). EffectTS identity: the
// EffectTS tree's packages are all 0.0.1, so the activation proof says
// `bundle 0.0.1` (the only identity-driven delta from the Boilerplate
// reference; asserted byte-identically by the smoke).
const Version = "0.0.1";

export default (Context: Context, Options: Config): void => {
	// The injected factory service (typed via Interface/Factory's Context
	// augmentation; guaranteed present by the inject declaration).
	const Factory = Context.pluginFactory;
	// The State: the factory's shared shape plus the CCR hook's own fields,
	// copied from the (cell-unwrapped) validated config by the setup map.
	const State: State = Factory.State<State>(Context, Options, {
		module: "ccr",
		fields: {
			Targets: "targets",
			Exempt: "exempt",
			Threshold: "thresholdBytes",
			InlineThreshold: "inlineThresholdBytes",
			AutoExpand: "autoExpand",
			AutoExpandLimit: "autoExpandLimitBytes",
			Failures: "compressFailures",
			Multipliers: "multipliers",
			PreviewMax: "previewMaxChars",
			Ttl: "ttlSeconds",
			Budget: "storeBudgetBytes",
			JournalPath: "journalPath",
			Engine: "contextEngine",
			EngineThresholdPct: "contextEngineThresholdPct",
			ProtectFirst: "protectFirstTurns",
			ProtectLast: "protectLastTurns",
		},
	});
	State.Factory = Factory;

	// The store: LRU + TTL, plus the optional JSONL journal (loaded and
	// compacted on boot; "" = memory-only). Per-apply, never a module-level
	// global - HMR reloads rebind it cleanly.
	State.Store = new Store(State.JournalPath);
	State.Store.BudgetBytes = State.Budget;

	// The phase-4 context engine runtime: built ONLY when the flag is on.
	// When off (the default), `EngineRuntime` stays undefined - no pre-step
	// listener is registered below and the post-execute listener observes
	// nothing, so the engine is fully inert.
	if (State.Engine) {
		State.EngineRuntime = { Turn: 1, Records: [] };
	}

	// Durable activation proof - "did it activate" must be answerable from the
	// ledger alone. Format (asserted byte-identical by the smoke):
	//   ccr: activated (bundle 0.0.1, targets 8, budget 268435456)
	// The line's string mechanics (the `activated (` prefix, the `k=v` join,
	// the `)` suffix) live in the core's Activate composer; the FIELD LIST is
	// the module's own (the empty-key pair renders the bare leading segment).
	Factory.Append(
		State,
		Activate([
			// Bare segments (empty key): the plan's exact activation format.
			["", `bundle ${Version}`],
			["", `targets ${State.Targets.length}`],
			["", `budget ${String(State.Budget)}`],
		]),
	);
	// The lifecycle record into the shared storage domain (best-effort; the
	// detail is byte-identical to the ledger line).
	Factory.Journal(
		State,
		"activated",
		"",
		`activated (bundle ${Version}, targets ${State.Targets.length}, budget ${State.Budget})`,
	); // The eviction lines: the store reports them, the module composes them.
	const LogEvictions = (Evicted: Eviction[]): void => {
		for (const Eviction of Evicted) {
			State.Factory.Append(State, `evicted ${Eviction.hash} (${Eviction.reason})`);
		}
	};

	// The context engine's observation: when the runtime exists (the flag is
	// on), every non-empty result is recorded with the current turn and
	// either its CONTENT (a pass-through verdict - never stored, the only
	// kind the engine may need to archive later) or its HASH (the verdict
	// already stored it - compressed or auto-expanded). Pure bookkeeping on
	// the runtime's log: no fs, no ledger - the decision happens at the next
	// agent/pre-step. Anything it throws is caught by the listener's
	// fail-open try/catch like the rest of the transform.
	const Observe = (
		Runtime: EngineRuntime,
		Name: string,
		IsError: boolean,
		Content: ContentBlock[],
		Verdict: Verdict,
	): void => {
		switch (true) {
			case Content.length === 0:
				return;
		}
		const Record: EngineRecord = {
			turn: Runtime.Turn,
			name: Name,
			isError: IsError,
			size:
				Verdict.action === "pass"
					? Buffer.byteLength(JSON.stringify(Content), "utf8")
					: Verdict.size,
		};
		switch (Verdict.action) {
			case "pass":
				Record.content = Content;
				break;
			default:
				Record.hash = Verdict.hash;
				break;
		}
		Runtime.Records.push(Record);
	};

	// The CCR hook's own Wire: one tools/post-execute waterfall listener,
	// owned by the current fiber (removed on unload - no manual removeListener
	// bookkeeping, ever). See the header for the full discipline.
	Context.on(
		"tools/post-execute",
		async (Exec, Result, Next) => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Decision = await Next();
			try {
				// Only an accepted, non-value-carrying decision can be replaced.
				if (Decision.kind !== "accept" || Object.hasOwn(Decision, "value")) {
					return Decision;
				}
				// The content basis: what downstream shaped, or the raw result.
				const Content = Decision.content ?? Result.content;
				const Verdict = Compress(State, Exec.name, Result.isError, Content);
				// The engine's observation (no-op unless the runtime exists).
				const EngineRuntime = State.EngineRuntime;
				if (EngineRuntime !== undefined) {
					Observe(EngineRuntime, Exec.name, Result.isError === true, Content, Verdict);
				}
				switch (Verdict.action) {
					case "pass":
						return Decision;
					case "store": {
						// Auto-expand: the entry is stored and retrievable, but the
						// FULL original content still reaches the model - no marker.
						State.Factory.Append(
							State,
							`stored ${Exec.name} ${Verdict.type} ${Verdict.size} -> ${Verdict.hash}`,
						);
						LogEvictions(Verdict.evicted);
						return Decision;
					}
					default: {
						// The replacement: the preview line + the exact marker bytes.
						State.Factory.Append(
							State,
							`compressed ${Exec.name} ${Verdict.type} ${Verdict.size} -> ${Verdict.hash}`,
						);
						LogEvictions(Verdict.evicted);
						return {
							kind: "accept",
							content: [
								{
									type: "text",
									text: `[${Verdict.type}:${Verdict.preview}]\n${Marker.format(
										Verdict.hash,
										Verdict.type,
										Verdict.size,
									)}`,
								},
							],
						};
					}
				}
			} catch (Error) {
				// Fail-open: keep the inline content, warn, never throw into the
				// waterfall (a thrown listener would fail the tool result).
				try {
					Context.logger?.warn(`ccr: ${String(Error)}; keeping the inline content`);
				} catch {
					/* logger optional */
				}
				return Decision;
			}
		},
		{ prepend: true },
	);

	// THE CONTEXT ENGINE'S LISTENER (registered only when the flag is on):
	// one `agent/pre-step` waterfall listener - the verified contract is the
	// harness's own shipped type (dsh-agent runtime-types.d.ts:304):
	//   'agent/pre-step'(payload: { agent, messages, turn, step, signal }, next)
	//     => Promise<PreStepDecision>
	// produced by the agent loop; listeners call `next()` and the returned
	// decision is authoritative. The engine is a PURE OBSERVER: `next()` is
	// awaited FIRST and the downstream decision is returned unchanged - the
	// decision contract covers only the newly claimed input messages, not
	// the history (Function/Engine's documented limitation). The family has
	// no prior agent/pre-step listener precedent; default ordering (no
	// options) since nothing needs to precede an observer. Same fail-open
	// discipline as the post-execute listener: never throw into the
	// waterfall.
	if (State.Engine) {
		Context.on("agent/pre-step", async (Payload, Next) => {
			// next() FIRST: the downstream listeners settle before any decision.
			const Decision = await Next();
			try {
				const EngineRuntime = State.EngineRuntime;
				if (EngineRuntime !== undefined) {
					// The step's turn: the payload's when it's a sane number,
					// otherwise the next logical turn (documented approximation).
					const Turn =
						typeof Payload?.turn === "number" &&
						Number.isFinite(Payload.turn) &&
						Payload.turn >= 1
							? Math.floor(Payload.turn)
							: EngineRuntime.Turn + 1;
					// The decision looks at the turns BEFORE this one: the
					// protect windows are relative to Turn - 1.
					const Plan = Decide(
						EngineRuntime.Records,
						Turn - 1,
						State.Budget,
						State.EngineThresholdPct,
						State.ProtectFirst,
						State.ProtectLast,
					);
					if (Plan !== undefined) {
						for (const Record of Plan.archive) {
							switch (true) {
								case Record.content === undefined:
									// Already stored at post-execute (hash record):
									// retrievable, nothing to re-store.
									continue;
							}
							// The EXISTING compress path with the gate opened:
							// the same classify/exempt/targets rules, the same
							// store, the same TTL + LRU accounting; the threshold
							// is 0 and auto-expand off so the record always lands
							// in the store. Evictions flow to the same ledger
							// lines as every other store insert.
							const Forced = { ...State, Threshold: 0, AutoExpand: false } as State;
							const Archived = Compress(
								Forced,
								Record.name,
								Record.isError,
								Record.content,
							);
							switch (true) {
								case Archived.action !== "pass":
									LogEvictions(Archived.evicted);
									break;
							}
						}
						// Retire the archived records: their bytes leave the
						// accumulator (the head-protected survivors stay and
						// keep counting - they remain inline by definition).
						const Retired = new Set(Plan.archive);
						const Kept = EngineRuntime.Records.filter((Record) => !Retired.has(Record));
						EngineRuntime.Records.length = 0;
						EngineRuntime.Records.push(...Kept);
						// The module's own new ledger line (asserted byte-identical
						// by the smoke): one aggregate line per archive event.
						State.Factory.Append(
							State,
							`engine archived ${Plan.archive.length} results`,
						);
					}
					EngineRuntime.Turn = Turn;
				}
			} catch (Error) {
				// Fail-open: the engine never breaks a step; warn and move on.
				try {
					Context.logger?.warn(`ccr: ${String(Error)}; the engine step is skipped`);
				} catch {
					/* logger optional */
				}
			}
			return Decision;
		});
	}

	// The ccr_retrieve TOOL: the definition is built (never mutated after
	// registration - the registration is READONLY per the skill) and
	// registered on the same fiber as the Wire, so unloading the plugin
	// unregisters the tool with it.
	Context.tools.register(Retrieve(State));

	// The loader ignores any return value; the smoke harness probes the built
	// State through this debug attachment instead (a bare `return State` is
	// avoided: loader behavior on apply return values is untrusted).
	(Context as { __ccrState?: State }).__ccrState = State;
};
