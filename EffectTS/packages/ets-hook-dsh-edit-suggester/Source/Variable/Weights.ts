// Weights - the DEFAULT weight table of the pickable heuristics: the current
// formula as DATA (completion spec 03-SUGGESTERS section 2: "the pickable
// heuristics table with weights").
//
//   score(c) = 0.35*scope + 0.00*graph + 0.25*prior + 0.25*literal
//            + 0.15*history + 0.00*accept
//
// With the neutral values (scope 1.00, graph 0.50, literal 0.50, history and
// accept 1/3) this is exactly the PoC formula
// 0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3), so a missing learning store
// keeps today's score byte-identically. The two placeholders carry 0 so the
// graph and the family rate are PICKABLE without changing the default; the
// config field `weights` overrides any subset (a missing name falls back to
// this table in Function/Weights).
//
// ONE SOURCE OF TRUTH: the schema default (Variable/Config) imports this
// constant, so the load default and the resolver fallback cannot drift.
export default {
	scope: 0.35,
	graph: 0,
	prior: 0.25,
	literal: 0.25,
	history: 0.15,
	accept: 0,
} as Record<string, number>;
