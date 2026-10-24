import type { Context } from "@deepseek-ai/cordis";
import type Learning from "../Interface/Learning.js";
export default _default;
declare function _default(
/** The plugin context (the optional service probe). */
Context: Context, 
/** The module id (the key prefix and the rate records' arbiter). */
Module: string, 
/** The memory fallback's bound (config `storeLimit`). */
Limit: number): Learning;
