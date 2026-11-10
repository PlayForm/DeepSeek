/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fs/observed listener and the
 * own P5-style storage effect.
 *
 * @remarks
 * The State build uses the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceAudit`, constructed
 * here so `ctx.workspaceAudit` resolves); the fs/observed listener is the
 * factory's Wire on the ROOT context. The contract is
 * Documentation/Plans/Workspace-Family/AUDIT.md +
 * WORKSPACE-FAMILY-V4-1.md section 2 item 6.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
 * registers the service (it reads honestly from the empty state), and wires
 * NOTHING - no listener, no storage effect, no events consumed.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceAuditState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
