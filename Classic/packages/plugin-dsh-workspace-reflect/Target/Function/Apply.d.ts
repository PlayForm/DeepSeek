/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, and the activation proof.
 *
 * @remarks
 * The State builds with the factory's cell unwrap + the P10 volatile refresh;
 * the service registers through `Function/Service` (`workspaceReflect`,
 * constructed here so `ctx.workspaceReflect` resolves). The contract is
 * REFLECT.md (the later stage).
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)` and
 * registers the service - every operation then answers `denied` with its own
 * ledger line, never a silent failure and never a write.
 *
 * There is NO listener and NO storage effect: the reflective ops are
 * request/response transformations over explicit service calls; their durable
 * record is the ledger file (one log per module), and the graph carry keeps
 * the representation current after each applied write.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__pluginDshWorkspaceReflectState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
