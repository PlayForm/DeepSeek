import { Service } from "@deepseek-ai/cordis";
import type { Context } from "@deepseek-ai/cordis";
import type { FsTarget, FsObservation, FsVersion, FsWriteOutcome } from "@deepseek-ai/dsh-fs";
import type { Over as WriteOver } from "./Function/Write.js";
import SchemaFn from "./Function/Schema.js";
import type { Registry as GovernRegistry, Selection as GovernSelection } from "./Function/Govern.js";
import type Shape from "@Interface/State.js";
import type Setup from "@Interface/Options.js";
import type Decision from "@Interface/Gate.js";
import type Transform from "@Interface/Transform.js";
import type { Context as Ctx } from "@deepseek-ai/cordis";
export type { default as State } from "@Interface/State.js";
export type { default as Options } from "@Interface/Options.js";
export type { default as Gate } from "@Interface/Gate.js";
export type { default as Transform } from "@Interface/Transform.js";
export type { default as Output } from "@Interface/Output.js";
export type { default as Journal } from "@Interface/Journal.js";
export declare function Schema(Shared?: {
    log?: boolean;
    logFile?: string;
    updateCooldownMs?: number;
    mutationTools?: string[];
    exclude?: string[];
    policyFile?: string;
} | false, Module?: Record<string, unknown>): ReturnType<typeof SchemaFn>;
export default class PluginFactory extends Service {
    static inject: string[];
    constructor(Context: Context);
    /** The ledger: logger + appendFileSync, never throws. */
    Append(State: Shape, Message: string): void;
    /** The exclusion-first segment match. */
    Match(Path: string, List: string[] | null | undefined): boolean;
    /** The auxiliary registry walk-up (plain-fs, the exemption). */
    Discover(Dir: string): string | null;
    /** The auxiliary JSON read — null on any failure (the exemption). */
    Parse(Path: string): unknown;
    /** The union keep-list discovery (P3 chain-keys union included). */
    ResolvePolicy(State: Shape, Dir: string, Found: string | null, Chain: string[], Options?: {
        policyFileField?: string;
        policyFileName?: string;
    }): string[];
    /** The g1 gate set — returns the pass decision, logs nothing. */
    Gate(State: Shape, Target: FsTarget, Observation: FsObservation, Actor: object | undefined, Options: {
        basename: string;
        mutationToolsField?: string;
    }): Decision;
    /** The ONE shared write executor (Function/Write): resolve stays
     *  caller-side; the `Over` bundle adds the intent (explicit intent skips
     *  the fs/write-intent waterfall, the default `{ waterfall: true }` runs
     *  it), the sandbox posture ("standing" = the built-in's no-escalation
     *  replica, "p4" = the per-call fence, or an explicit policy), the
     *  root-context fs/observed emit (default true), the Stash
     *  pre-registration and the caller's content transform. Logs nothing -
     *  the caller composes its own ledger line from the outcome. */
    Write(State: Shape, Target: FsTarget, Content: string, Over?: WriteOver): Promise<FsWriteOutcome>;
    /** The guarded write — the GUARDED ALIAS of Write (SCHEME.md §2.7): the
     *  explicit replaceIfVersion intent (waterfall skipped), the P4 sandbox
     *  fence, the Stash pre-registration; the re-emit stays delegated to
     *  Refresh (observe: false — the same-actor U₂ semantics). */
    GuardedWrite(State: Shape, Target: FsTarget, Content: string, Version: FsVersion, Signal?: AbortSignal): Promise<FsWriteOutcome>;
    /** The P₃/U₂ refresh: register the version, re-emit with the same actor. */
    Refresh(State: Shape, Target: FsTarget, Actor: object | undefined, Version: FsVersion): void;
    /** The detached contained continuation (the module supplies the transform). */
    Continue(State: Shape, Target: FsTarget, Actor: object | undefined, Dir: string, Found: string | null, Version: FsVersion, Transform: Transform): Promise<void>;
    /** The State builder: cell unwrap + shared fields + module extras. */
    State<Extra extends object = Record<string, unknown>>(Context: Ctx, Config: unknown, Setup: Setup): Shape & Extra;
    /** The fs/observed registration (the module supplies its observe). */
    Wire(Context: Ctx, State: Shape, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void): void;
    /** The lifecycle effects: P1 jobs controller, P2 inflight disposal, P5 storage. */
    Attach(Context: Ctx, Module: {
        state: Shape;
        name: string;
    }): void;
    /** The P5 storage-domain writer (best-effort, never throws). Routes
     *  through the SHARED journal sink when one is bound (Function/Open —
     *  the live single-open-domain finding: the harness's storageDomain
     *  enforces ONE open per domain name, so the first module whose Open
     *  succeeds binds the shared package_governance put here, and every
     *  module's records — all consumers hold this same service instance —
     *  land in the one shared table; without it, the later modules' Opens
     *  fail `already-open` and their records silently never land). */
    Journal(State: Shape, Event: string, Path: string, Detail: string, At?: number): void;
    /** The SHARED P5 journal sink (see Journal): bound by the first
     *  successful Function/Open (per service instance — each test context
     *  gets a fresh factory, so the smokes stay per-scenario). The PRE-BIND
     *  stage is `PendingJournal` (below): records journaled before the first
     *  successful open buffer there, and the successful Open drains them
     *  through the sink it just bound — closing the boot-window race. */
    SharedJournal?: (Event: string, Path: string, Detail: string, At?: number) => void;
    /** The PRE-BIND journal buffer (P5, the boot-window race): the factory-
     *  level queue holding records journaled before ANY open has succeeded
     *  (each module's apply journals its `activated` record before its own
     *  Attach's Open completes — only the FIRST module's open wins; the other
     *  modules' per-State queues never drain, so their records must live
     *  here). Capped at 256 like the per-State pre-open queue (Function/
     *  State); `undefined` once the first successful Function/Open has
     *  drained it and bound `SharedJournal` (the pre-bind stage is over). */
    PendingJournal?: {
        event: string;
        path: string;
        detail: string;
        at: number;
    }[] | undefined;
    /** The Schemastery schema factory (shared volatile fields + module fields). */
    Schema(Shared?: {
        log?: boolean;
        logFile?: string;
        updateCooldownMs?: number;
        mutationTools?: string[];
        exclude?: string[];
        policyFile?: string;
    }, Module?: Record<string, unknown>): import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
    }>>, "plain"> | import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        log: import("@deepseek-ai/schemastery").default<boolean, boolean, "volatile-defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "volatile-defined">;
        updateCooldownMs: import("@deepseek-ai/schemastery").default<number, number, "volatile-defined">;
        mutationTools: import("@deepseek-ai/schemastery").default<NoInfer<string[]>, NoInfer<string[]>, "volatile-defined">;
        policyFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        exclude: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
    }>>, "plain">;
    /** The namespaced State.Inflight key for UPDATE-STAGE controllers
     *  (v0.1.1, P2 — the cargo collision lesson, factory-side): the chain
     *  pass (Continue) registers under the PLAIN `String(targetKey)`; an
     *  update stage MUST register its run controller under this namespaced
     *  key (`update:<targetKey>`), or the chain pass's settlement could
     *  silently delete the running update's controller. */
    UpdateKey(Target: FsTarget): string;
    /** The probe-once optional-service accessor (never the dead accessor). */
    Seam(State: Shape, Name: string): unknown;
    /** The direct-govern registry (the SharedJournal pattern, instance-level):
     *  basename → the ordered steps `{ name, run }` the governance modules
     *  registered at apply (Function/Govern). The run closures capture their
     *  own State, so the chain pass, the update stage and every ledger string
     *  stay the MODULE'S own, byte-identical. Empty until the first module
     *  registers — a raw-write `govern` call against an empty registry is a
     *  contained no-op. */
    GovernSteps: GovernRegistry;
    /** Register a direct-govern step for one basename (the modules call this
     *  at apply). Re-registering the same name for the same basename replaces
     *  the step in place (keeping its registered position — an HMR reload
     *  rebinds the closure without duplicating the step); a new name appends
     *  after the registered ones. */
    RegisterGovern(Basename: string, Name: string, Run: (Target: FsTarget, Actor: object | undefined, Version: FsVersion) => Promise<void> | void): void;
    /** The direct-govern entry (the raw-write tool's post-write call):
     *  resolve the registered steps for the target's basename, filter by the
     *  selection (`true`/"all" = every registered step; an array or a single
     *  name = only the named steps; unknown names ignored; false/absent =
     *  none), and run each in REGISTERED order — contained, one try/catch per
     *  step (the family's silence invariant: never throws, never affects the
     *  caller). The SEQUENTIAL FOLD (v0.2.1): the method is async and AWAITS
     *  each step, so every step's chain (its guarded write + its ledger line)
     *  completes before the next step reads the file — the version-guarded
     *  `replaceIfVersion` writes can never race, and a multi-step selection
     *  (e.g. canonicalize + update) is deterministic. The raw-write exec
     *  awaits this call: the tool's result returns after the fold completes.
     *  Best-effort by design; see Function/Govern. */
    Govern(Target: FsTarget, Selection: GovernSelection, Actor: object | undefined, Version: FsVersion): Promise<void>;
}
