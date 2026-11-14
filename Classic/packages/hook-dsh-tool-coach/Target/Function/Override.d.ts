import type { ToolCatalog, ToolOverride } from "../Interface/Execution.js";
export default _default;
/**
 * Apply the overrides. A catalog with no overrides is returned unchanged, so an
 * untouched deployment pays nothing.
 */
declare function _default(Catalog: ToolCatalog, Overrides: Record<string, ToolOverride>): ToolCatalog;
