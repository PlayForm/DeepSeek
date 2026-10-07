// Library - the entry module of the FACTORY (@playform/plugin-dsh-factory),
// the FIRST class/service plugin in the governance family
// (docs/user/develop/framework/service.md). Loader contract: the class form -
// `export default class PluginFactory extends Service` with
// `super(Context, "pluginFactory")`, registered immediately on construction
// and removed with its owning fiber; `static inject = ["fs"]` because the
// factory's primitives call ctx.fs (the governed-file read and the
// version-guarded write). The ONLY named exports are the TYPE re-exports
// (State/Options/Gate/Transform/Output - the consumer contract, P0-1): every
// other module is a nameless default export composed Rust-style, and each
// service method is a thin delegate.
//
// THE EFFECT-TS RE-IMPLEMENTATION (register #13, the factory round): the
// harness shell STAYS a cordis `Service` class - the loader contract is not
// an Effect concept - but behind it the machinery becomes
// `Context.Service`s provided by `Layer`s and composed into ONE runtime that
// the constructor materializes (Source/Service/Runtime.ts:
// `Layer.mergeAll(Ledger, Journal, Write, Govern)` →
// `Effect.scoped(Layer.build(...))`). Each public method delegates into that
// runtime at one of the four boundary types of the plan (1.4):
//
//   * SYNC methods (Append/Journal/Refresh - the plain-fs exemption, the
//     queue-offer bridge): `Effect.runSync(Effect.provide(Tag.use(...),
//     runtime))` - sync in, sync out, byte-identical behavior;
//   * PROMISE seams (Write/GuardedWrite/Continue/Govern): `Effect.runPromise
//     (Effect.provide(...))` - NO RunOptions are passed, so the caller's
//     abort signal is never mapped onto the fiber: it rides the write SEAM
//     only (forwarded to `writeText` end to end, exactly like the Classic
//     promise chain). A fiber interruption would replace the seam's own
//     rejection with Effect's "All fibers interrupted without error" and
//     break the abort path's byte parity (see Write);
//   * the fs/observed registration (Wire) stays the sync listener shape the
//     harness requires; the Attach lifecycle effects stay the ctx.effect
//     seams - those two are Function-owned (Wire/Attach), untouched;
//   * the plugin lifecycle: the runtime holds no scoped resources (all four
//     layers are `Layer.succeed` closures that read the shell's instance
//     state at call time), so the loader's removal needs no extra disposal.
//
// THE SERVICE SURFACE (ctx.pluginFactory - every signature documented in
// README.md / SCHEME.md, byte-identical names and parameters):
//
//   Append(state, message)                 - the ledger (logger + appendFileSync, never throws)
//   Match(path, list)                      - the exclusion segment match
//   Discover(dir) / Parse(path)            - the auxiliary plain-fs discovery (the exemption)
//   ResolvePolicy(state, dir, found, chain, opts?) - the union keep-list discovery (P3 chain-keys included)
//   Gate(state, target, observation, actor, opts)  - the g1 gate set (logs nothing)
//   Write(state, target, content, over?)   - the ONE shared write executor (intent/policy/observe/stash/transform)
//   GuardedWrite(state, target, content, version, signal?) - the GUARDED ALIAS of Write (P4 fence + Stash)
//   Refresh(state, target, actor, version) - the P₃/U₂ re-emit (same actor)
//   Continue(state, target, actor, dir, found, version, transform) - the detached contained continuation
//   State(ctx, config, {module, fields, policyFileName?}) - the State builder
//   Wire(ctx, state, observe)              - the fs/observed registration
//   Attach(ctx, {state, name})             - the P1 jobs + P2 inflight + P5 storage effects
//   Journal(state, event, path, detail)    - the P5 storage writer (best-effort)
//   Schema(shared?, module?)               - the Schemastery schema factory
//   UpdateKey(target)                      - the namespaced Inflight key for update stages
//   Seam(state, name)                      - the probe-once optional-service accessor
//   RegisterGovern(basename, name, run)    - the direct-govern step registration (the modules call it at apply)
//   Govern(target, selection, actor, version): Promise<void> - the direct-govern entry (the raw-write tool's post-write call; the SEQUENTIAL FOLD, v0.2.1, the #14 parallel marker opt-in)
//
// THE DIRECT-GOVERN REGISTRY (`GovernSteps`, the SharedJournal pattern at the
// instance level): basename → the ordered steps `{ name, run }` the modules
// registered at apply (Function/Govern). The run closures capture their own
// State, so every ledger string stays the MODULE'S own, byte-identical.
// `Govern` resolves the steps for the target's basename, filters them by the
// selection (`true`/"all" = all; an array or a single name = the named steps;
// unknown names ignored; false/absent = none; the #14 marker form
// `{ steps, parallel }` = the inner selection with the fold's concurrency
// switched - sequential by default), and runs each contained.
//
// The MODULE LEDGER STRINGS stay in the modules (the factory never owns
// them): the transform's messages, the activation proof, the observe-path
// lines. The factory's own composed strings are parameterized machinery
// (the unreadable-policy line, the suppressed-error lines prefixed with
// State.Module) and stay byte-identical when the module keeps its historical
// name.
import { Effect } from "effect";
import { Service } from "@deepseek-ai/cordis";
import type { Context } from "@deepseek-ai/cordis";
import type { FsTarget, FsObservation, FsVersion, FsWriteOutcome } from "@deepseek-ai/dsh-fs";
import Match from "./Function/Match.js";
import Discover from "./Function/Discover.js";
import Parse from "./Function/Parse.js";
import Resolve from "./Function/Resolve.js";
import Gate from "./Function/Gate.js";
import type { Over as WriteOver } from "./Function/Write.js";
import RefreshFn from "./Function/Refresh.js";
import Continue from "./Function/Continue.js";
import Build from "./Function/State.js";
import Wire from "./Function/Wire.js";
import AttachEffects from "./Function/Attach.js";
import SchemaFn from "./Function/Schema.js";
import SeamFn from "./Function/Seam.js";
import UpdateKey from "./Function/UpdateKey.js";
import { Ledger as LedgerService } from "./Service/Ledger.js";
import { Journal as JournalService } from "./Service/Journal.js";
import { Write as WriteService } from "./Service/Write.js";
import { Govern as GovernService } from "./Service/Govern.js";
import { materialize } from "./Service/Runtime.js";
import type { Services as FactoryRuntime } from "./Service/Runtime.js";
import type {
	Registry as GovernRegistry,
	Selection as GovernSelection,
} from "./Function/Govern.js";
import type Shape from "@Interface/State.js";
import type Setup from "@Interface/Options.js";
import type Decision from "@Interface/Gate.js";
import type Transform from "@Interface/Transform.js";
import type { Context as Ctx } from "@deepseek-ai/cordis";

// The NAMED TYPE exports (P0-1): the four structural contracts + the output
// shape, re-exported from the entry so consumers can `import type { State,
// Options, Gate, Transform, Output } from "@playform/plugin-dsh-factory"`
// instead of deriving them through `Parameters<Factory["..."]>[0]` - and
// instead of mirroring the shapes locally (the pre-fix structural mirrors).
// The declarations ship RELATIVE specifiers (the deterministic build emits
// ./Interface/*.js), so a consumer's tsconfig paths never re-map them.
export type { default as State } from "@Interface/State.js";
export type { default as Options } from "@Interface/Options.js";
export type { default as Gate } from "@Interface/Gate.js";
export type { default as Transform } from "@Interface/Transform.js";
export type { default as Output } from "@Interface/Output.js";
export type { default as Journal } from "@Interface/Journal.js";

// The standalone SCHEMA helper (v0.1.1, P1): the module-level composition of
// the shared block + the module's own fields - `Schema(shared?, module?)`,
// exactly the instance method's delegate (Function/Schema never reads
// `this`). The loader needs `Config` at MODULE-EVALUATION time, before any
// context (and therefore any service instance) exists, so a consumer cannot
// literally `export const Config = factory.Schema(...)` - this named export
// is the module-load use. `shared: false` emits the MINIMAL block (only the
// universal log/logFile volatile cells) for non-manifest modules.
export function Schema(
	Shared:
		| {
				log?: boolean;
				logFile?: string;
				updateCooldownMs?: number;
				mutationTools?: string[];
				exclude?: string[];
				policyFile?: string;
		  }
		| false = {},
	Module: Record<string, unknown> = {},
): ReturnType<typeof SchemaFn> {
	return SchemaFn(Shared, Module);
}

// The service: class form, injected on fs, registered as `pluginFactory`.
// Behind the shell, the constructor materializes the Effect runtime (the
// four-service Layer graph); every machinery method delegates into it at a
// boundary.
export default class PluginFactory extends Service {
	static inject = ["fs"];

	constructor(Context: Context) {
		super(Context, "pluginFactory");
		// The pre-bind journal buffer (P5, the boot-window race): starts as the
		// live buffer - records land here between construction and the first
		// successful Function/Open; Function/Open drains it and retires it
		// (sets it to `undefined`) when the shared sink binds.
		this.PendingJournal = [];
		// The direct-govern registry: empty until the modules register their
		// steps at apply (RegisterGovern). Per factory instance - each test
		// context gets a fresh factory, so the smokes stay per-scenario.
		this.GovernSteps = {};
		// The Effect runtime: the four-service Layer graph materialized ONCE per
		// instance (Source/Service/Runtime.ts). The layers are plain succeed
		// closures - the services read this instance's fields (SharedJournal/
		// PendingJournal/GovernSteps) at call time - so nothing dies with the
		// build scope and the loader's removal needs no extra disposal.
		this.Runtime = materialize(this);
	}

	/** The materialized Effect runtime (see the constructor). */
	private readonly Runtime: FactoryRuntime;

	/** The ledger: logger + appendFileSync, never throws. The
	 *  LedgerService wraps the byte-identical machinery in the
	 *  `dsh.ledger.append` span; the sync boundary is `Effect.runSync`. */
	Append(State: Shape, Message: string): void {
		Effect.runSync(
			Effect.provide(
				LedgerService.use((Service) => Service.append(State, Message)),
				this.Runtime,
			),
		);
	}

	/** The exclusion-first segment match. */
	Match(Path: string, List: string[] | null | undefined): boolean {
		return Match(Path, List);
	}

	/** The auxiliary registry walk-up (plain-fs, the exemption). */
	Discover(Dir: string): string | null {
		return Discover(Dir);
	}

	/** The auxiliary JSON read - null on any failure (the exemption). */
	Parse(Path: string): unknown {
		return Parse(Path);
	}

	/** The union keep-list discovery (P3 chain-keys union included). */
	ResolvePolicy(
		State: Shape,
		Dir: string,
		Found: string | null,
		Chain: string[],
		Options?: { policyFileField?: string; policyFileName?: string },
	): string[] {
		return Resolve(State, Dir, Found, Chain, Options);
	}

	/** The g1 gate set - returns the pass decision, logs nothing. */
	Gate(
		State: Shape,
		Target: FsTarget,
		Observation: FsObservation,
		Actor: object | undefined,
		Options: { basename: string; mutationToolsField?: string },
	): Decision {
		return Gate(State, Target, Observation, Actor, Options);
	}

	/** The ONE shared write executor (the WriteService): resolve stays
	 *  caller-side; the `Over` bundle adds the intent (explicit intent skips
	 *  the fs/write-intent waterfall, the default `{ waterfall: true }` runs
	 *  it), the sandbox posture ("standing" = the built-in's no-escalation
	 *  replica, "p4" = the per-call fence, or an explicit policy), the
	 *  root-context fs/observed emit (default true), the Stash
	 *  pre-registration and the caller's content transform. Logs nothing -
	 *  the caller composes its own ledger line from the outcome. The caller's
	 *  abort signal is forwarded to the write SEAM only (end to end, exactly
	 *  like the Classic promise chain) - it is NOT mapped onto the fiber: a
	 *  fiber interruption would replace the seam's own error with
	 *  Effect's "All fibers interrupted without error" and break the byte
	 *  parity of the abort path (the Classic executor propagates the seam's
	 *  rejection verbatim - the dash smoke asserts "aborted before write"). */
	Write(
		State: Shape,
		Target: FsTarget,
		Content: string,
		Over: WriteOver = {},
	): Promise<FsWriteOutcome> {
		return Effect.runPromise(
			Effect.provide(
				WriteService.use((Service) => Service.write(State, Target, Content, Over)),
				this.Runtime,
			),
		);
	}

	/** The guarded write - the GUARDED ALIAS of Write (SCHEME.md §2.7): the
	 *  explicit replaceIfVersion intent (waterfall skipped), the P4 sandbox
	 *  fence, the Stash pre-registration; the re-emit stays delegated to
	 *  Refresh (observe: false - the same-actor U₂ semantics). */
	GuardedWrite(
		State: Shape,
		Target: FsTarget,
		Content: string,
		Version: FsVersion,
		Signal?: AbortSignal,
	): Promise<FsWriteOutcome> {
		return this.Write(State, Target, Content, {
			intent: { kind: "replaceIfVersion", version: Version },
			signal: Signal,
			policy: "p4",
			stash: true,
			observe: false,
		});
	}

	/** The P₃/U₂ refresh: register the version, re-emit with the same actor.
	 *  The `dsh.refresh` span wraps the best-effort machinery (Function/
	 *  Refresh contains internally - the sync boundary never throws). */
	Refresh(State: Shape, Target: FsTarget, Actor: object | undefined, Version: FsVersion): void {
		Effect.runSync(
			Effect.sync(() => RefreshFn(State, Target, Actor, Version)).pipe(
				Effect.withSpan("dsh.refresh"),
			),
		);
	}

	/** The detached contained continuation (the module supplies the transform).
	 *  The effect body (Function/Continue) never fails - the Classic
	 *  whole-body containment - so the promise boundary can never reject on
	 *  behalf of the listener either. */
	Continue(
		State: Shape,
		Target: FsTarget,
		Actor: object | undefined,
		Dir: string,
		Found: string | null,
		Version: FsVersion,
		Transform: Transform,
	): Promise<void> {
		return Effect.runPromise(
			Effect.provide(
				Continue(State, Target, Actor, Dir, Found, Version, Transform),
				this.Runtime,
			),
		);
	}

	/** The State builder: cell unwrap + shared fields + module extras. */
	State<Extra extends object = Record<string, unknown>>(
		Context: Ctx,
		Config: unknown,
		Setup: Setup,
	): Shape & Extra {
		return Build<Extra>(Context, Config, Setup);
	}
	/** The fs/observed registration (the module supplies its observe). */
	Wire(
		Context: Ctx,
		State: Shape,
		Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void,
	): void {
		Wire(Context, State, Observe);
	}

	/** The lifecycle effects: P1 jobs controller, P2 inflight disposal, P5 storage. */
	Attach(Context: Ctx, Module: { state: Shape; name: string }): void {
		AttachEffects(Context, Module);
	}

	/** The P5 storage-domain writer (best-effort, never throws). The
	 *  JournalService routes through the three stages - the SHARED journal
	 *  sink when one is bound (Function/Open - the live single-open-domain
	 *  finding: the harness's storageDomain enforces ONE open per domain
	 *  name, so the first module whose Open succeeds binds the shared
	 *  package_governance put here, and every module's records - all
	 *  consumers hold this same service instance - land in the one shared
	 *  table; without it, the later modules' Opens fail `already-open` and
	 *  their records silently never land). */
	Journal(State: Shape, Event: string, Path: string, Detail: string, At?: number): void {
		Effect.runSync(
			Effect.provide(
				JournalService.use((Service) => Service.record(State, Event, Path, Detail, At)),
				this.Runtime,
			),
		);
	}

	/** The SHARED P5 journal sink (see Journal): bound by the first
	 *  successful Function/Open (per service instance - each test context
	 *  gets a fresh factory, so the smokes stay per-scenario). The PRE-BIND
	 *  stage is `PendingJournal` (below): records journaled before the first
	 *  successful open buffer there, and the successful Open drains them
	 *  through the sink it just bound - closing the boot-window race. */
	SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;

	/** The PRE-BIND journal buffer (P5, the boot-window race): the factory-
	 *  level queue holding records journaled before ANY open has succeeded
	 *  (each module's apply journals its `activated` record before its own
	 *  Attach's Open completes - only the FIRST module's open wins; the other
	 *  modules' per-State queues never drain, so their records must live
	 *  here). Capped at 256 like the per-State pre-open queue (Function/
	 *  State); `undefined` once the first successful Function/Open has
	 *  drained it and bound `SharedJournal` (the pre-bind stage is over). */
	PendingJournal?: { event: string; path: string; detail: string; at: number }[] | undefined;

	/** The Schemastery schema factory (shared volatile fields + module fields). */
	Schema(
		Shared?: {
			log?: boolean;
			logFile?: string;
			updateCooldownMs?: number;
			mutationTools?: string[];
			exclude?: string[];
			policyFile?: string;
		},
		Module?: Record<string, unknown>,
	) {
		return SchemaFn(Shared, Module);
	}

	/** The namespaced State.Inflight key for UPDATE-STAGE controllers
	 *  (v0.1.1, P2 - the cargo collision lesson, factory-side): the chain
	 *  pass (Continue) registers under the PLAIN `String(targetKey)`; an
	 *  update stage MUST register its run controller under this namespaced
	 *  key (`update:<targetKey>`), or the chain pass's settlement could
	 *  silently delete the running update's controller. */
	UpdateKey(Target: FsTarget): string {
		return UpdateKey(Target);
	}

	/** The probe-once optional-service accessor (never the dead accessor). */
	Seam(State: Shape, Name: string): unknown {
		return SeamFn(State, Name);
	}

	/** The direct-govern registry (the SharedJournal pattern, instance-level):
	 *  basename → the ordered steps `{ name, run }` the governance modules
	 *  registered at apply (Function/Govern). The run closures capture their
	 *  own State, so the chain pass, the update stage and every ledger string
	 *  stay the MODULE'S own, byte-identical. Empty until the first module
	 *  registers - a raw-write `govern` call against an empty registry is a
	 *  contained no-op. */
	GovernSteps: GovernRegistry;

	/** Register a direct-govern step for one basename (the modules call this
	 *  at apply). Re-registering the same name for the same basename replaces
	 *  the step in place (keeping its registered position - an HMR reload
	 *  rebinds the closure without duplicating the step); a new name appends
	 *  after the registered ones. */
	RegisterGovern(
		Basename: string,
		Name: string,
		Run: (
			Target: FsTarget,
			Actor: object | undefined,
			Version: FsVersion,
		) => Promise<void> | void,
	): void {
		const List = this.GovernSteps[Basename] ?? (this.GovernSteps[Basename] = []);
		const At = List.findIndex((Step) => Step.name === Name);
		const Step = { name: Name, run: Run };
		switch (true) {
			case At >= 0:
				List[At] = Step; // HMR reload - replace in place, position preserved
				break;
			default:
				List.push(Step);
		}
	}

	/** The direct-govern entry (the raw-write tool's post-write call):
	 *  resolve the registered steps for the target's basename, filter by the
	 *  selection (`true`/"all" = every registered step; an array or a single
	 *  name = only the named steps; the #14 marker form `{ steps, parallel }`
	 *  = the inner selection with the fold's concurrency switched; unknown
	 *  names ignored; false/absent = none), and run each in REGISTERED order -
	 *  contained, one exit per step (the family's silence invariant: never
	 *  throws, never affects the caller). The SEQUENTIAL FOLD (v0.2.1, the
	 *  default): the steps run one at a time (`Effect.forEach` with
	 *  concurrency 1), so every step's chain (its guarded write + its ledger
	 *  line) completes before the next step reads the file - the
	 *  version-guarded `replaceIfVersion` writes can never race, and a
	 *  multi-step selection (e.g. canonicalize + update) is deterministic.
	 *  The #14 PARALLEL MARKER (opt-in `{ steps, parallel: true }`) switches
	 *  the fold to `Effect.all` with unbounded concurrency - disjoint targets
	 *  only; same-file steps race. The raw-write exec awaits this call: the
	 *  tool's result returns after the fold completes. Best-effort by design;
	 *  see Function/Govern. */
	async Govern(
		Target: FsTarget,
		Selection: GovernSelection,
		Actor: object | undefined,
		Version: FsVersion,
	): Promise<void> {
		await Effect.runPromise(
			Effect.provide(
				GovernService.use((Service) =>
					Service.run(this.GovernSteps, Target, Selection, Actor, Version),
				),
				this.Runtime,
			),
		);
	}
}
