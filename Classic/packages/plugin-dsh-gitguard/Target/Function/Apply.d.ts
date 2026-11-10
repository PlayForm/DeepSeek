/**
 * @module Apply
 *
 * The plugin entry function: fail-loud validation, the State build (the
 * factory's cell unwrap + the P10 volatile refresh), the activation proof, and
 * the tools/pre-execute registration (Function/Guard - the intercept).
 *
 * @remarks
 * The contract is ORCHESTRATION-PLUGINS.md section 3.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default and
 * the bundle patch row). A cold mount logs `disabled (enabled=false)` and wires
 * NOTHING - no listener, no ledger.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the `ctx.__pluginDshGitguardState`
 * attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
