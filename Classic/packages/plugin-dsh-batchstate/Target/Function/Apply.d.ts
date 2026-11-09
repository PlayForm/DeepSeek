/**
 * @module Apply
 *
 * The plugin entry function: it validates the config fail-loud, builds the State, registers the
 * service, appends the activation proof, and recovers the store.
 *
 * @remarks
 * The State build is the factory's cell unwrap plus the P10 volatile refresh. The service
 * registration (Function/Service - `batchstate`) is constructed here so `ctx.batchstate` resolves.
 *
 * THE STORE SPLIT (the completion spec's wave 3 storage migration): the KV domain
 * (Function/Storage, config `domain`, default `batch_state`) is the PRIMARY store - the plugin
 * probes the harness's storage facility once and opens the domain in its own effect, closing it on
 * dispose. The well-known JSON state file (Function/Recover, config `stateFile`) is the DEGRADED
 * FALLBACK, engaged only when no facility is provided (or the open fails). Both feed the SAME
 * recovery (Function/Restore), so the byte-exact `recovered (<n> members, queue <n>)` line, the
 * honest active -> interrupted downgrade and the malformed-row skip are identical.
 *
 * The contract is BATCH-STATE-PLUGIN.md sections 2 and 7.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default and the bundle patch
 * row). A cold mount logs `disabled (enabled=false)`, registers the service (it reads honestly
 * from the empty state), and wires NOTHING - no listener, no event, no store.
 *
 * The function returns NOTHING (the loader contract: a returned value silently kills event
 * delivery). The test probe is the `ctx.__pluginDshBatchstateState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "@Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
