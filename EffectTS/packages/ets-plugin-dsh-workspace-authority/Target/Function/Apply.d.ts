/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build, the
 * service registration and the activation proof.
 *
 * @remarks
 * The State build is the factory's cell unwrap plus the P10 volatile
 * refresh; the service registration is Function/Service
 * (`workspaceAuthority`).
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false. A cold mount logs
 * `disabled (enabled=false)`; the service still registers (it reads
 * honestly from the empty state) but grants, leases and evictions are
 * refused with a byte-stable `refused ... (the authority is disabled)` line
 * until enabled.
 *
 * The function returns NOTHING (the loader contract). The test probe is the
 * `ctx.__PluginDshWorkspaceAuthorityState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
