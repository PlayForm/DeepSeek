import type { Context } from "@deepseek-ai/cordis";
import type Learning from "../Interface/Learning.js";
export default _default;
/**
 * The per-mount learning store: the core's machinery bound to this package's probe.
 */
declare function _default(
/**
 * The plugin context (the optional service probe).
 */
Context: Context, 
/**
 * The module id (the key prefix and the rate records' arbiter).
 */
Module: string, 
/**
 * The memory fallback's bound (config `storeLimit`).
 */
Limit: number): Learning;
