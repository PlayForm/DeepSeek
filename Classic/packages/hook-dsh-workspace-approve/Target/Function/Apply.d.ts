/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build (the
 * factory's cell unwrap plus the P10 volatile refresh), the service
 * registration (`Function/Service` - `workspaceApprove`, constructed here so
 * `ctx.workspaceApprove` resolves), the activation proof, the fs/observed
 * listener (the factory's Wire on the ROOT context), and the own P5-style
 * storage effect. The contract is APPROVE.md.
 *
 * @remarks
 * The idle-forever posture: `enabled` defaults to false (the schema default and
 * the bundle patch row). A cold mount logs `disabled (enabled=false)`,
 * registers the service (it reads honestly from the empty state), and wires
 * NOTHING - no listener, no storage effect, no events consumed.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceApproveState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
