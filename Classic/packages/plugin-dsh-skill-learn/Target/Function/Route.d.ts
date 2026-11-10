import type Agent from "../Interface/Agent.js";
import type Configuration from "../Interface/Configuration.js";
/**
 * @module Route
 *
 * The model route one review call uses: the config override first, the agent's own
 * options second, and nothing else.
 *
 * @remarks
 *
 * WHY THE OVERRIDE WINS: the review is an auxiliary call, and the operator may want it
 * on a cheaper model than the conversation (plan section 9, keys 28 and 29). An empty
 * override means "use the agent's route", which is the shipped posture, so the
 * resolution is a plain two-step fallback rather than a merge: a provider from one
 * source and a model from the other would name a route that neither the agent nor the
 * operator asked for, and the harness resolves a route by the pair
 * (`dsh-llm/lib/types/types.d.ts:506-509`).
 *
 * ABSENT IS `undefined`, NOT AN EMPTY ROUTE. The caller reports `no-route` and never
 * calls the model with an empty provider, because an empty provider is not a fallback
 * in the harness - it is `NO_ADAPTER` at call time
 * (`Temporary/Research/DSH-Skill-Surface.md:202`). The distinction matters to the
 * ledger: `no-route` is one of the twelve outcome classes (plan section 3.2), and it
 * can only be produced by a resolver that answers with an absence.
 */
/**
 * A resolved route: both halves are present, by construction.
 */
export interface Route {
    readonly provider: string;
    readonly model: string;
}
export default _default;
declare function _default(Agent: Agent, Knobs: Pick<Configuration, "provider" | "model">): Route | undefined;
