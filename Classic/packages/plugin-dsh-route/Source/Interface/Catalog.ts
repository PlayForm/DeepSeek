/**
 * @module Catalog
 *
 * The SELF-CONTAINED declaration of the harness LLM catalog's shape (the
 * `ctx.llm` service behind the `list_subagent_models` tool).
 *
 * @remarks
 * The PoC rule: declare the sibling service's shape in your own Interface/,
 * never import the package that may not be wired.
 *
 * Only `listModels` is consumed: the escalation ladder (Function/Ladder) needs
 * the model ids ONE provider advertises, to keep the rung inside the live
 * catalog. Everything else on the service (providers, reasoning efforts,
 * request resolution) belongs to the model-facing tool, not to the enforcer.
 */

/**
 * One advertised model (the id is the only field the ladder reads).
 */
export interface ModelInfo {
	/**
	 * The advertised model id.
	 */
	id: string;
}

/**
 * The structural shape the plugin probes for (the `ctx.llm` service).
 */
export default interface CatalogService {
	/**
	 * The model ids ONE provider advertises.
	 */
	listModels: (Provider: string) => Promise<ModelInfo[]>;
}
