import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: a THIN MODULE over the injected factory service,
 * building the State, emitting the activation proof and attaching the
 * fs/observed Wire, the direct-govern registration and the lifecycle effects.
 *
 * @remarks
 *
 * The factory service arrives injected (ctx.pluginFactory - the loader holds
 * this bundle pending until the factory service exists). Everything here is
 * factory machinery; the module owns only its identity, its ledger strings and
 * its observe/transform:
 *
 * 1. State - Furnace.State(ctx, config, { module: "hook-dsh-pinner-package",
 *    fields: { On: "enabled", Section: "sections" }, policyFileName:
 *    "pin-policy.json", journalDomain: "hook_dsh_package_pinner" }): the shared
 *    shape (defensive cell unwrap of the factory's volatile shared fields,
 *    Tool/Policy/Ledger/Enabled/List mappings, Stash/Inflight/Seams/Queue/
 *    Journal, the P9 subprocess probe) + the master switch (On <- enabled: a
 *    disabled pinner appends `disabled (enabled=false)` and returns before
 *    registering anything) + the pinner's Section.
 * 2. The activation proof - the MODULE'S ledger strings: the durable
 *    `activated (...)` Append ("did it activate" must be answerable from the
 *    ledger alone) and the P5 Journal record.
 * 3. Wire - the fs/observed hook (Function/Observe).
 * 4. Attach - the P1 jobs-controller, P2 in-flight-disposal and P5
 *    storage-domain effects, labeled `hook-dsh-pinner-package-*`.
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
 */
declare function _default(Context: Context, Options: Config): void;
