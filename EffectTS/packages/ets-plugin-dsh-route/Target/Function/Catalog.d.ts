export default _default;
/**
 * @module Catalog
 *
 * The LIVE model catalog probe for the escalation ladder's rung check.
 *
 * @remarks
 *
 * The ladder verifies its rung against the models the provider actually
 * advertises, exactly the data `list_subagent_models` reads (the `llm`
 * service's `listProviders` / `listModels` / `resolveModelInfo`). The route
 * plugin consumes the narrowest slice: the advertised model ids for ONE
 * provider.
 *
 * The probe runs at use time (never an injection dependency - the plugin
 * ships disabled independently of the LLM runtime) and fails open by design:
 * an absent service, a throwing adapter, or a malformed answer all yield
 * `undefined`, which Function/Ladder reads as "no catalog proof - keep the
 * policy's rung". Silence is the contract; a catalog failure never surfaces.
 */
declare function _default(Context: unknown, Provider: string): Promise<string[] | undefined>;
