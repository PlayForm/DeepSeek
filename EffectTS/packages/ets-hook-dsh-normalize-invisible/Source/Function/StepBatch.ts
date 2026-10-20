// StepBatch - the ets-hook-dsh-normalize-invisible's THIN DELEGATE over the
// ETS base's step-batch arm factory (@playform/ets-base-dsh/Overpass/
// StepBatch). The generic machinery lives in the base; this file supplies
// only what makes it THE NORMALIZE-INVISIBLE:
//
//   * the invisible transform - the core's Invisible class pinned to the
//     configured replacement (default removal), read per call from the
//     volatile-refreshed State;
//   * the invisible ledger line - byte-identical with the Classic tree's line:
//     `overpass: normalized N char(s) in step batch (turn T step S)`;
//   * the invisible ledger sink - State.Factory.Append / State.Factory.Journal;
//   * the invisible module identity - State.Module (the Classic identity,
//     `hook-dsh-normalize-invisible`), prefixed by the factory's Append.
//
// The default export is the listener itself (the factory's return), so
// Function/Apply's registration and the import path stay untouched.
import type { PreStepDecision } from "@deepseek-ai/dsh-agent";
import type State from "@Interface/State.js";
import { StepBatch } from "@playform/ets-base-dsh";

import Replace from "./Replace.js";

export default StepBatch<State, { turn?: unknown; step?: unknown }, PreStepDecision>(
	// The FLAVOR: the invisible transform pinned to the configured replacement,
	// read per call from the (volatile-refreshed) State.
	(Text, State) => Replace(Text, State.Replacement),
	// The MODULE's ledger line (the base owns only the mechanics).
	(Count, Turn, Step) =>
		`overpass: normalized ${Count} char(s) in step batch (turn ${Turn} step ${Step})`,
	// The MODULE's ledger sink (the factory service, injected).
	{
		Append: (State, Line) => State.Factory.Append(State, Line),
		Journal: (State, Event, Path, Value) => State.Factory.Journal(State, Event, Path, Value),
	},
);
