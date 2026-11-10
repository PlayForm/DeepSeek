/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * activation proof, the fs/observed listener and the test probe attachment.
 *
 * @remarks
 * The contract is Documentation/Plans/Workspace-Family/MONITOR.md.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default
 * and the bundle patch row). A cold mount logs `disabled (enabled=false)`
 * and wires NOTHING - no listener, no watch state, no events consumed.
 *
 * The function returns NOTHING (the loader contract: a returned value
 * silently kills event delivery). The test probe is the
 * `ctx.__hookDshWorkspaceMonitorState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
