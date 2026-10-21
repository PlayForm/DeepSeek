// StepBatch - the hook-dsh-normalize-fullwidth's THIN DELEGATE over the
// core's step-batch arm factory (@playform/lib-dsh-core/Overpass/StepBatch).
// The generic machinery (next() first, the continuous scope gate, the one-shot
// `Overpass` flag and its consumption, the text-only block rewrite, the CCR
// marker guard, the fail-open, the identity-preserving no-op) lives in the
// core; this file supplies only what makes it THE NORMALIZE-FULLWIDTH:
//
//   * the fullwidth transform - the core's Fullwidth map pinned to the ASCII
//     counterparts (the one-argument delegate ignores State: the map has no
//     replacement knob);
//   * the fullwidth ledger line - the module's own string, byte-identical
//     with the pre-delegate arm:
//     `overpass: normalized N char(s) in step batch (turn T step S)`;
//   * the fullwidth ledger sink - State.Factory.Append / State.Factory.Journal;
//   * the fullwidth module identity - State.Module, which the factory's Append
//     prefixes (the delegate never hardcodes the identity).
//
// The default export is the listener itself (the factory's return), so
// Function/Apply's registration and the import path stay untouched.
import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "@Interface/State.js";
import { StepBatch } from "@playform/lib-dsh-core";

import Replace from "./Replace.js";

export default StepBatch<State, { turn?: unknown; step?: unknown }, PreStepDecision>(
	// The FLAVOR: the fullwidth transform (the one-argument delegate).
	(Text) => Replace(Text),
	// The MODULE's ledger line (the core owns only the mechanics).
	(Count, Turn, Step) =>
		`overpass: normalized ${Count} char(s) in step batch (turn ${Turn} step ${Step})`,
	// The MODULE's ledger sink (the factory service, injected).
	{
		Append: (State, Line) => State.Factory.Append(State, Line),
		Journal: (State, Event, Path, Value) => State.Factory.Journal(State, Event, Path, Value),
	},
);
