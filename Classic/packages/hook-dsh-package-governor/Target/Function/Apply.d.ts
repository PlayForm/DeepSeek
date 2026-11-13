import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function, now a thin module wire-up: the factory owns the scaffolding.
 *
 * @remarks
 *
 * The module builds the State through `Factory.State` (the cell unwrap, the shared mappings
 * Tool<-mutationTools, Policy<-policyFile, Ledger<-logFile, Enabled<-log, List<-exclude, and the
 * machinery structures - SCHEME.md §2.10), adds the module's own fields via the setup `fields`
 * map (On <- enabled - the master switch: the ONE mount-time effect of the flag is the ledger
 * line - a disabled governor appends `disabled (enabled=false)` INSTEAD of the activation
 * proof and still registers EVERYTHING - the LIVE disabled posture), delegates ALL lifecycle
 * effects to `Factory.Attach` (P1 jobs controller, P2 in-flight disposal, P5 storage domain -
 * SCHEME.md §2.12), emits the
 * durable activation proof (the module's own string, via Factory.Append + Factory.Journal), and
 * wires the fs/observed hook through `Factory.Wire` (SCHEME.md §2.11).
 *
 * The module's own residue, deliberately kept here:
 *   - the update machinery birth request - the setup `updates: true` option (the
 *     cooldown / per-dir in-flight / circuit-breaker collections themselves - Stamp, Set,
 *     Count - are born FRESH by the factory's State builder, per mount, never module-level);
 *   - the module identity for the factory ("hook-dsh-governor-package" - doubles as the prefix
 *     of every factory-composed line, keeping them byte-identical);
 *   - the activation proof string (the module's ledger vocabulary);
 *   - the `ctx.__hookDshGovernorPackageState` test probe.
 *
 * The function returns NOTHING - never a value: the loader treats apply return values
 * specially, and a returned State object silently killed event delivery (live-verified
 * 2026-10-03). Test probes read the state through the `ctx.__hookDshGovernorPackageState`
 * attachment instead.
 *
 * `inject: ["fs", "pluginFactory"]` - the factory is a REQUIRED service; the loader's PENDING
 * state handles the ordering (the plugin loads only when both fs and pluginFactory exist). The
 * update stage runs through the attached P1 controller (Factory.Attach); the subprocess seam
 * (bin mode) is probed once by the factory's State builder (P9).
 *
 * @example
 * ```ts
 * export default Apply;
 * ```
 */
declare function _default(Context: Context, Options: Config): void;
