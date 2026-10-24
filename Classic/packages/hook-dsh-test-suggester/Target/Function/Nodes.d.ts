import type { Context } from "@deepseek-ai/cordis";
export default _default;
declare function _default(
/** The plugin context (the optional-service probe). */
Context: Context, 
/** The package root the nodes must sit under. */
PackageRoot: string, 
/** The resolved workspace root. */
Root: string): string[];
