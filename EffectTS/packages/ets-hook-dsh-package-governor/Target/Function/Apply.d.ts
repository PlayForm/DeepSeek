import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: a thin module wire-up that builds the State,
 * delegates the lifecycle effects to the factory, emits the durable activation
 * proof and wires the fs/observed hook.
 *
 * @remarks
 *
 * The factory owns the scaffolding: `Factory.State` performs the cell unwrap
 * and the shared mappings Tool<-mutationTools, Policy<-policyFile,
 * Ledger<-logFile, Enabled<-log, List<-exclude, and the machinery structures
 * (SCHEME.md §2.10). `Factory.Attach` handles all lifecycle effects (P1 jobs
 * controller, P2 in-flight disposal, P5 storage domain - SCHEME.md §2.12), and
 * `Factory.Wire` wires the fs/observed hook (SCHEME.md §2.11).
 *
 * The module's own residue, deliberately kept here:
 * - the cooldown / per-dir in-flight / circuit-breaker collections (Stamp,
 *   Set, Count) - update-engine state, not factory machinery;
 * - the module identity for the factory ("hook-dsh-governor-package" -
 *   doubles as the prefix of every factory-composed line, keeping them
 *   byte-identical);
 * - the activation proof string (the module's ledger vocabulary);
 * - the `ctx.__hookDshGovernorPackageState` test probe.
 *
 * The function returns NOTHING - never a value: the loader treats apply return
 * values specially, and a returned State object silently killed event delivery
 * (live-verified 2026-10-03). Test probes read the state through the
 * `ctx.__hookDshGovernorPackageState` attachment instead.
 *
 * `inject: ["fs", "pluginFactory"]` - the factory is a REQUIRED service; the
 * loader's PENDING state handles the ordering (the plugin loads only when both
 * fs and pluginFactory exist). The update stage runs through the attached P1
 * controller (Factory.Attach); the subprocess seam (bin mode) is probed once
 * by the factory's State builder (P9).
 */
declare function _default(Context: Context, Options: Config): void;
