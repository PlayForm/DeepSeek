/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration, the activation proof, the trace adapter, the tool
 * registration, and the optional token-meter probe.
 *
 * @remarks
 * The State build is the factory's cell unwrap + the P10 volatile refresh.
 * The service registration is Function/Service (`workspaceContext`,
 * constructed here so `ctx.workspaceContext` resolves). The trace adapter
 * consumes `graph/invalidated` to invalidate the packet memo - wired only
 * after the enabled gate. The token-meter probe is V4-1 section 4: the
 * orientation budget uses ctx.tokenMeter where available.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)`,
 * registers the service (it answers honestly from whatever the graph
 * provides), and registers no tool.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__pluginDshWorkspaceContextState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
