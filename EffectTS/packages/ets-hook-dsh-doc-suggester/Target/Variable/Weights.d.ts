/**
 * @module Weights
 *
 * The default weight table of the pickable heuristics: the current formula
 * as DATA (completion spec 03-SUGGESTERS section 2: "the pickable
 * heuristics table with weights").
 *
 * @remarks
 * `score(c) = 0.35*scope + 0.00*graph + 0.25*prior + 0.25*literal
 * + 0.15*history + 0.00*accept`
 *
 * With the neutral values (scope 1.00, graph 0.50, literal 0.50, history and
 * accept 1/3) this is exactly the PoC formula
 * `0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3)`, so a missing learning
 * store keeps today's score byte-identically. The two placeholders carry 0
 * so the graph and the family rate are PICKABLE without changing the
 * default; the config field `weights` overrides any subset (a missing name
 * falls back to this table in Function/Weights).
 *
 * ONE SOURCE OF TRUTH: the schema default (Variable/Config) imports this
 * constant, so the load default and the resolver fallback cannot drift.
 */
/**
 * The default weight table, keyed by the heuristic name.
 */
declare const _default: Record<string, number>;
export default _default;
