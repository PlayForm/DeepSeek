/**
 * @module Apply
 *
 * The plugin entry function.
 *
 * @remarks
 * The entry path is fail-loud validation, the State build (the factory's cell
 * unwrap + the P10 volatile refresh), the service registration (Function/Service
 * - `workspaceSemantics`, constructed here so `ctx.workspaceSemantics` resolves),
 * the adapter registrations (the default TypeScript adapter, Function/TypeScript,
 * then the opt-in any-file adapters named by config `adapters`,
 * Function/Adapters), the LSP deepener registration (Function/Deepen +
 * Function/Lsp), the activation proof, the fs/observed listener (the factory's
 * Wire on the ROOT context), and the own P5-style storage effect. The contract
 * is SEMANTICS.md.
 *
 * THE IDLE-FOREVER POSTURE: `enabled` defaults to false (the schema default and
 * the bundle patch row). A cold mount logs `disabled (enabled=false)`, registers
 * the service and the adapters (it answers honestly: resolve on an empty index
 * still builds through the adapter), and wires NOTHING else - no listener, no
 * storage effect, no events consumed.
 *
 * The function returns NOTHING (the loader contract: a returned value silently
 * kills event delivery). The test probe is the
 * `ctx.__pluginDshWorkspaceSemanticsState` attachment.
 */
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default _default;
declare function _default(Context: Context, Options: Config): void;
