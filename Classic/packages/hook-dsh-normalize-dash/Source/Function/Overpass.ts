// Overpass - the hook-dsh-normalize-dash's THIN DELEGATE over the core's
// tool-results arm factory (@playform/lib-dsh-core/Overpass/ToolResults).
// The generic machinery (next() first, the tool-results scope gate, the
// exemption list, the accepted/non-value decision rules, the content basis,
// the text-only block rewrite, the CCR marker guard, the fail-open, the
// identity-preserving no-op) lives in the core; this file supplies only what
// makes it THE NORMALIZE-DASH:
//
//   * the dash transform - the core's Dashes class pinned to the configured
//     replacement, read per call from the volatile-refreshed State;
//   * the dash ledger line - the module's own string, byte-identical with
//     the pre-delegate arm:
//     `overpass: normalized N char(s) in tool result <name> <callId>`;
//   * the dash ledger sink - State.Factory.Append / State.Factory.Journal;
//   * the dash module identity - State.Module, which the factory's Append
//     prefixes (the delegate never hardcodes the identity);
//   * the schema-default exemption list, exported here because the module's
//     `normalize-overpass scopes` command reports it (Function/Command).
//
// The default export is the listener itself (the factory's return), so
// Function/Apply's `{ prepend: true }` registration and the import path stay
// untouched. The registration is what makes the arm OUTERMOST in the family's
// bundle order; the core's marker guard makes any load order safe.
import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "@Interface/State.js";
import { ToolResults } from "@playform/lib-dsh-core";

import Replace from "./Replace.js";

/** The schema-default scopes (the fallback for a hand-built config). */
export const DefaultScopes = {
	conversation: true,
	reasoning: true,
	toolInput: false,
	toolResults: false,
	files: true,
	batch: false,
};

/** The schema-default exemption list (the fallback for a hand-built config). */
export const DefaultExempt = [
	"read",
	"edit",
	"raw-write",
	"normalize-file",
	"ccr_retrieve",
	"subagent",
	"ask_user_question",
];

export default ToolResults<State, PostToolDecision>(
	// The FLAVOR: the dash transform pinned to the configured replacement,
	// read per call from the (volatile-refreshed) State.
	(Text, State) => Replace(Text, State.Replacement),
	// The MODULE's ledger line (the core owns only the mechanics).
	(Count, Name, CallID) =>
		`overpass: normalized ${Count} char(s) in tool result ${Name} ${CallID}`,
	// The MODULE's ledger sink (the factory service, injected).
	{
		Append: (State, Line) => State.Factory.Append(State, Line),
		Journal: (State, Event, Path, Value) => State.Factory.Journal(State, Event, Path, Value),
	},
	// The MODULE's schema-default exemption list.
	DefaultExempt,
);
