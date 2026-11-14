import type { ToolCatalog, ToolEntry, ToolOverride } from "@Interface/Execution.js";

/**
 * @module Override
 *
 * The user-override layer of the tool catalog: the `toolDescriptions` config
 * cell applied on top of whatever the fetch produced.
 *
 * @remarks
 *
 * The precedence is the whole point of the module:
 *   1. a `toolDescriptions` entry (the user's words) WINS;
 *   2. the live `ctx.tools.schemas()` projection (the harness's own words);
 *   3. the generated static table (Variable/Catalog, the harness's words from a
 *      pinned submodule commit, used when the registry is unreachable).
 *
 * The override is per FIELD, not per tool: a user who rewords a description
 * keeps the harness's parameter surface, and a user who pins the parameters
 * keeps the harness's description. An override may also name a tool the catalog
 * does not carry at all (a tool this deployment adds), which is why the empty
 * entry exists.
 */

/**
 * The entry an override starts from when the catalog does not carry the tool.
 */
const EMPTY: ToolEntry = { description: "", param: "", params: [] };

/**
 * The primary parameter of a surface: the first REQUIRED key, else the first
 * key, else the base entry's own primary.
 */
const Primary = (Params: ToolEntry["params"], Fallback: string): string =>
	Params.find((Param) => Param.required)?.name ?? Params[0]?.name ?? Fallback;

/**
 * Apply the overrides. A catalog with no overrides is returned unchanged, so an
 * untouched deployment pays nothing.
 */
export default (Catalog: ToolCatalog, Overrides: Record<string, ToolOverride>): ToolCatalog => {
	const Names = Object.keys(Overrides ?? {});
	if (Names.length === 0) {
		return Catalog;
	}
	const Tools = new Map(Catalog.tools);
	for (const Name of Names) {
		const Override = Overrides[Name];
		if (Override === undefined) {
			continue;
		}
		const Base = Tools.get(Name) ?? EMPTY;
		// An EMPTY params list means "not provided", not "no parameters": the
		// schema's array default is `[]`, so a description-only override would
		// otherwise erase the harness's whole parameter surface.
		const Params =
			Array.isArray(Override.params) && Override.params.length > 0
				? Override.params.map((Param) => ({
						name: Param.name,
						required: Param.required === true,
						...(Param.default === undefined ? {} : { default: Param.default }),
					}))
				: Base.params;
		Tools.set(Name, {
			description: Override.description ?? Base.description,
			param: Primary(Params, Base.param),
			params: Params,
		});
	}
	return { source: Catalog.source, tools: Tools };
};
