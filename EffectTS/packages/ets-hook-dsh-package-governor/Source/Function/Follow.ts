// Follow — the update-stage trigger that follows the factory's continuation
// (Function/Continue). The factory owns the chain pass's scaffolding (read,
// union keep-list, guarded write, message, P₃ refresh), so the update stage —
// which the pre-refactor Function/Continue ran inline after the rewrite — now
// runs OFF the settled continuation: Function/Observe chains this follow-up
// onto the Continue promise, and this module reproduces the old g4 preamble
// byte-identically:
//
//   1. the passage gate — a refused rewrite, a failed guarded write or an
//      undecodable manifest left `Passage.Proceed` false (the transform only
//      opens the passage on the no-change path or inside the post-write
//      message callback): no update stage;
//   2. the Filter gate — nothing public for ncu to do: no update stage;
//   3. the FIRST-WINS update-policy path pick (Function/Resolve — the
//      governor's ENGINE INPUT, deliberately NOT the factory's union
//      keep-list discovery: the update policy selects how ncu runs, it never
//      strips chain pins);
//   4. the dispatch (Function/Dispatch — the jobs envelope + gates).
//
// Contained like the factory's continuation: a bug-level throw here is
// logger-only (`hook-dsh-governor-package: continuation error (suppressed): …`), never
// the ledger, never a rethrow, never an unhandled rejection — the silence
// invariant.
import Filter from "./Filter.js";
import Resolve from "./Resolve.js";
import Dispatch from "./Dispatch.js";
import { Suppress } from "@playform/ets-hook-dsh-core";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";

export default async (
	State: State,
	Target: FsTarget,
	Actor: object | undefined,
	Dir: string,
	Found: string | null,
	Registry: Registry | null,
	Passage: Passage,
): Promise<void> => {
	try {
		// 1 — the passage gate (see header).
		switch (true) {
			case !Passage.Proceed:
				return;
		}
		// 2 — nothing for ncu to do (every dep is chain-governed).
		switch (true) {
			case !Filter(Passage.Current, Registry):
				return;
		}
		// 3+4 — the first-wins engine-input policy path pick (see header) feeding
		// the update stage (jobs envelope, gates, engines, settlement).
		await Dispatch(State, Target, Actor, Dir, Registry, Resolve(State, Dir, Found));
	} catch (Cause) {
		// Contained follow-up: logger only, never the ledger, never a rethrow
		// (the CORE's Suppress composer — the module identity, never a hardcoded
		// prefix).
		try {
			State.Context.logger.error?.(Suppress(State.Module, "continuation", Cause));
		} catch {
			/* logger optional */
		}
	}
};
