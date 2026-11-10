import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function of the cargo module, a thin composition of the
 * `@playform/plugin-dsh-factory` service injected as `pluginFactory`.
 *
 * @remarks
 *
 * The composition has four steps:
 *
 * 1. State — the factory's State builder (cell unwrap, the fixed shared
 *    mappings Tool←mutationTools / Policy←policyFile / Ledger←logFile /
 *    Enabled←log / List←exclude, the module fields by name, the fresh
 *    Stash/Inflight/Seams/Queue structures and the P9 probe-once "subprocess"
 *    seam through the factory's Function/Seam). The module adds its own
 *    update-stage collections (Stamp/Set/Count) on top.
 * 2. The activation proof — the module's OWN Append + Journal: "did it
 *    activate" must be answerable from the ledger alone, and the cargo module
 *    string is distinct from the package.json governor's.
 * 3. Wire — the factory's fiber-owned fs/observed registration (the module
 *    supplies its observe; the hook is fs/observed ONLY — never
 *    fs/write-intent / fs/edit-intent, never tools/*).
 * 4. Attach — the factory's lifecycle effects: P1 (the root jobs controller,
 *    probed via ctx.get), P2 (the in-flight disposal — every detached
 *    continuation's abort controller is aborted and cleared on unload) and P5
 *    (the optional storageDomain — the State's journalDomain option's domain,
 *    "hook_dsh_cargo_governor" here; absent → silent skip, the sink retired).
 *
 * The function returns NOTHING — never a value: the loader treats apply return
 * values specially, and a returned State object silently killed event delivery
 * (live-verified 2026-10-03). Test probes read the per-dir in-flight/breaker
 * maps through the `ctx.__hookDshGovernorCargoState` attachment instead.
 */
declare function _default(Context: Context, Options: Config): void;
