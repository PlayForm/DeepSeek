import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: a thin module over the injected factory service,
 * owning only its identity, its ledger strings and its observe/transform.
 *
 * @remarks
 *
 * Everything here is factory machinery (ctx.pluginFactory, injected - the
 * loader holds this bundle pending until the factory service exists):
 * - State - Furnace.State(ctx, config, { module: "hook-dsh-pinner-package",
 *   fields: { Section: "sections" }, policyFileName: "pin-policy.json",
 *   journalDomain: "hook_dsh_package_pinner" }): the shared shape (defensive
 *   cell unwrap of the factory's volatile shared fields,
 *   Tool/Policy/Ledger/Enabled/List mappings, Stash/Inflight/Seams/Queue/
 *   Journal, the P9 subprocess probe) + the pinner's Section.
 * - The activation proof - the MODULE'S ledger strings: the durable
 *   `activated (...)` Append ("did it activate" must be answerable from the
 *   ledger alone) and the P5 Journal record.
 * - Wire - the fs/observed hook (Function/Observe).
 * - Attach - the P1 jobs-controller, P2 in-flight-disposal and P5
 *   storage-domain effects, labeled `hook-dsh-pinner-package-*`.
 *
 * The function returns NOTHING - never a value: the loader treats apply return
 * values specially, and a returned State object silently killed event delivery
 * (live-verified 2026-10-03). The built State is exposed via the context
 * attachment `__hookDshPinnerPackageState` for test probes (the smoke asserts
 * the factory wiring through it).
 *
 * Hook: fs/observed only. NEVER fs/write-intent / fs/edit-intent (the
 * single-slot waterfalls belong to the observation policy; registering there
 * would veto it). Never tools/* (result amendment is louder).
 *
 * THE EFFECT DELTA (R4, mirroring the R3 governor pattern): the plugin's
 * long-lived Effect `Scope` is created synchronously right after the State
 * (`State.Scope = Effect.runSync(Scope.make())` - apply is a sync seam, and a
 * sync `Scope.make` run through `Effect.runSync` is fully synchronous, so no
 * async boundary is introduced). THE PINNER HAS NO UPDATE STAGE - it never
 * uses the core's typed-effect Update envelope (no Dispatch/Settle; its only
 * core imports are the plain composers Activate / Suppress / Refusal) and its
 * pin chain runs as the FACTORY'S detached contained continuation (the
 * factory's own Effect runtime: the `dsh.chain-pass` span, the WriteService,
 * the `Effect.ensuring` P2 finalizer) - so, unlike the governor, no
 * `Scope.provide` call site consumes the scope and NO module span is added
 * here (the R2/R3 style puts spans on typed-effect boundaries only; the direct
 * pin step is a Continue consumer exactly like the governor's Canonicalize,
 * which carries none either). The field exists for the family's uniform State
 * shape and for any future Effect-native stage, which would adopt it via
 * `Scope.provide`. The loader does not close it - the pinner's disposal
 * semantics stay the Classic ones (the P2 Inflight abort kills any in-flight
 * pass's controller; the factory's Attach effect owns that).
 */
declare function _default(Context: Context, Options: Config): void;
