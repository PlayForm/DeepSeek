import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the one tool, and the own
 * P5-style storage effect. The contract is Documentation/Plans/Workspace-
 * Family/MERGE.md.
 *
 * @remarks
 *
 * The State build is the factory's cell unwrap plus the P10 volatile
 * refresh; the service registration is `Function/Service`
 * (`workspaceMerge`, constructed here so `ctx.workspaceMerge` resolves);
 * the one tool is `workspace_merge`, registered per the family's
 * tools-live-in-their-owning-hook law.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs
 * `disabled (enabled=false)` and registers EVERY surface - the tool and the
 * storage effect, beside the service. Every registered surface checks the
 * flag at CALL time (the volatile cell refreshed in place by the factory's
 * P10 loader/volatile-update listener, never captured at mount): a disabled
 * commit is refused with the rejected reply shape and ZERO ledger lines
 * (Function/Commit), and a volatile flip acts on the very next call in both
 * directions, with no remount.
 *
 * The function returns NOTHING (the loader contract). The test probe is
 * the `ctx.__hookDshWorkspaceMergeState` attachment.
 */
declare function _default(Context: Context, Options: Config): void;
