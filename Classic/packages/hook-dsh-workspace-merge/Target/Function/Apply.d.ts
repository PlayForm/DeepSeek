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
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs
 * `disabled (enabled=false)`, registers the service (it reads honestly from
 * the empty state), and wires NOTHING - no tool, no storage effect.
 *
 * The function returns NOTHING (the loader contract). The test probe is
 * the `ctx.__hookDshWorkspaceMergeState` attachment.
 */
declare function _default(Context: Context, Options: Config): void;
