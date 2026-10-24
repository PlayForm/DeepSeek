// Catalog - the LIVE model catalog probe: the escalation ladder verifies its
// rung against the models the provider actually advertises, exactly the data
// `list_subagent_models` reads (the `llm` service's `listProviders` /
// `listModels` / `resolveModelInfo`). The route plugin consumes the narrowest
// slice: the advertised model ids for ONE provider.
//
// Probed at use time (never an injection dependency - the plugin ships
// disabled independently of the LLM runtime) and fail-open by design: an
// absent service, a throwing adapter, or a malformed answer all yield
// `undefined`, which Function/Ladder reads as "no catalog proof - keep the
// policy's rung". Silence is the contract; a catalog failure never surfaces.
import type CatalogService from "@Interface/Catalog.js";

export default async (Context: unknown, Provider: string): Promise<string[] | undefined> => {
	const Llm = (Context as { get?: (Name: string) => unknown } | undefined)?.get?.("llm") as
		CatalogService | undefined;
	if (Llm === undefined || typeof Llm.listModels !== "function") {
		return undefined;
	}
	try {
		const Models = await Llm.listModels(Provider);
		return Models.map((Model) => Model?.id).filter(
			(Id): Id is string => typeof Id === "string",
		);
	} catch {
		// Fail-open: no catalog proof, the policy's rung stands.
		return undefined;
	}
};
