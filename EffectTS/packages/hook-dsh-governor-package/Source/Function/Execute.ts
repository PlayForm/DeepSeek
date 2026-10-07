// Execute — the update stage's body (runs in the detached continuation
// started by Function/Dispatch). The policy is resolved in-process, the chain
// deps are merged into ncu's reject list (the cordis-trap guard: ncu must
// never bump a chain pin to public npm latest), every invocation runs through
// the selected mode, and the optional verifyCommand follows. Returns an
// exit-style code: 0 success, 1 the ncu stage failed, 2 the verify stage
// failed — the code feeds the JobOutcome detail and the
// "update stage FAILED (<code>)" ledger line, mirroring the old child's exit
// status.
//
// Never rejects: every stage is contained; the promise always resolves a code.
// Ledger lines go through the FACTORY (State.Factory.Append) — the strings
// are the module's.
import Policy from "./Update/Policy.js";
import Run from "./Update/Run.js";
import Verify from "./Update/Verify.js";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Invocation from "@Interface/Invocation.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";

export default async (
	State: State,
	Root: string,
	// Forwarded to the completion chain by Function/Dispatch (Settle needs the
	// target and actor for the U₂ refresh); this body only runs the stages.
	_Target: FsTarget,
	_Actor: object | undefined,
	Registry: Registry | null,
	PolicyPath: string,
	Signal: AbortSignal,
	// Optional job-ring pipe (P1): in bin mode the raw CLI output is appended
	// to the harness job's output ring IN ADDITION to the ledger; undefined in
	// the detached fallback (nothing to append to).
	Emit?: (text: string) => void,
): Promise<number> => {
	const Chosen = Policy(State, PolicyPath);
	// reject = policy.reject ∪ chain deps (the cordis-trap guard), both modes.
	const Reject = [
		...new Set([...(Chosen.reject ?? []), ...Object.keys(Registry?.effectiveLatest ?? {})]),
	];
	const Invocations: Invocation[] = [
		{
			label: "base",
			target: Chosen.targets?.default ?? "latest",
			filter: null,
		},
		...(Chosen.targets?.overrides ?? []).map((Choice) => ({
			label: `filter ${Choice.filter}`,
			target: Choice.target,
			filter: Choice.filter,
		})),
	];
	let Ok = await Run(
		State,
		State.Mode,
		Invocations,
		Root,
		Chosen.depGroups ?? ["prod"],
		Chosen.concurrency ?? 8,
		Reject,
		Chosen.allow?.length ? Chosen.allow : undefined,
		State.Binary,
		Signal,
		Emit,
	);
	switch (true) {
		case Ok && !!Chosen.verifyCommand:
			Ok = await Verify(State, Chosen.verifyCommand as string, Root, Signal);
			break;
	}
	switch (true) {
		case Ok:
			State.Factory.Append(State, `update: DONE — pins bumped per policy`);
			return 0;
		default:
			State.Factory.Append(State, `update: FAILED — see lines above`);
			return 1;
	}
};
