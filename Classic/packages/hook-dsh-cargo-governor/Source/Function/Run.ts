// Run — the update stage's body (runs in the detached continuation started
// by Function/Dispatch; the SAME ROLE as the package.json governor's
// Function/Update/Run — the naming unification, P4). The policy is resolved
// in-process (the same non-quiet materialization as the parent governor —
// the policy ledger lines belong to the job), the chain deps are merged
// into cargo upgrade's --exclude list (the cordis-trap analog: the CLI must
// never bump a chain-governed pin), the single invocation runs through the
// Rust-side CLI (Function/Update/Upgrade — there is no npm-library
// equivalent for cargo manifest updates), and the optional verifyCommand
// follows. Returns an exit-style code: 0 success, 1 the cargo or verify
// stage failed — the code feeds the "update stage FAILED (<code>)" ledger
// line, mirroring the child's exit status in the parent governor.
//
// Never rejects: every stage is contained; the promise always resolves a code.
// The ledger lines go through the FACTORY's Append (State.Module supplies the
// "hook-dsh-governor-cargo" prefix — the strings stay the module's).
import type PluginFactory from "@playform/dsh-plugin-factory";
import Policy from "./Update/Policy.js";
import Upgrade from "./Update/Upgrade.js";
import Verify from "./Verify.js";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Invocation from "@Interface/Invocation.js";
import type Job from "@Interface/Job.js";
import type { FsTarget } from "@deepseek-ai/dsh-fs";

export default async (
	Factory: PluginFactory,
	State: State,
	Root: string,
	// Forwarded to the completion chain by Function/Dispatch (Settle needs the
	// target and actor for the U₂ refresh); the manifest path also feeds
	// cargo upgrade's --manifest-path.
	Target: FsTarget,
	_Actor: object | undefined,
	Registry: Registry | null,
	PolicyPath: string,
	Signal: AbortSignal,
	// The probed jobs runtime's live log (Function/Dispatch): the cargo CLI
	// output pipes into it IN ADDITION to the ledger digest lines. Undefined
	// in the detached continuation (no job view exists there).
	Sink: Job | undefined,
): Promise<number> => {
	const Chosen = Policy(Factory, State, PolicyPath);
	const Invocations: Invocation[] = [
		{
			label: "base",
			// One invocation per run — cargo upgrade has no per-package target
			// selector (documented mapping gap), so targets.overrides have no
			// cargo-edit equivalent.
			allow: Chosen.allow?.length ? Chosen.allow : null,
			// exclude = policy.reject ∪ chain deps (the cordis-trap guard).
			exclude: [
				...new Set([
					...(Chosen.reject ?? []),
					...Object.keys(Registry?.effectiveLatest ?? {}),
				]),
			],
		},
	];
	let Ok = true;
	for (const Call of Invocations) {
		switch (true) {
			case !(await Upgrade(
				Factory,
				State,
				State.CargoBin,
				Target.displayPath,
				Root,
				Call,
				Chosen,
				Signal,
				Sink,
			)):
				Ok = false;
				break;
		}
	}
	switch (true) {
		case Ok && !!Chosen.verifyCommand:
			Ok = await Verify(Factory, State, Chosen.verifyCommand as string, Root, Signal);
			break;
	}
	switch (true) {
		case Ok:
			Factory.Append(State, `update: DONE — pins bumped per policy`);
			return 0;
		default:
			Factory.Append(State, `update: FAILED — see lines above`);
			return 1;
	}
};
