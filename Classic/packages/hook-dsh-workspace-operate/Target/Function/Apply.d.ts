import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the fence tracker, the two
 * tools, and the own storage effect.
 *
 * @remarks
 *
 * The State build uses the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceOperate`,
 * constructed here so `ctx.workspaceOperate` resolves). The fence tracker is
 * the factory's Wire on the ROOT context (the staleness rule's data source,
 * silent by design). The two tools are workspace_propose +
 * workspace_proposals, registered per the family's
 * tools-live-in-their-owning-hook law. The storage effect is the own
 * P5-style one. The contract is
 * Documentation/Plans/Workspace-Family/OPERATE.md.
 *
 * THE LIVE DISABLED POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs
 * `disabled (enabled=false)` and registers EVERY surface - the fs/observed
 * fence tracker, the two tools and the storage effect, beside the service.
 * Every registered surface checks the flag at CALL time (the volatile cell
 * refreshed in place by the factory's P10 loader/volatile-update listener,
 * never captured at mount): a disabled fence tracker stays silent, a
 * disabled propose refuses with the typed `disabled` refusal and ZERO
 * ledger lines (Function/Propose), and a volatile flip acts on the very
 * next call in both directions, with no remount.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceOperateState` attachment.
 */
declare function _default(Context: Context, Options: Config): void;
