// Run — dispatch every policy invocation through the selected mode — "bin"
// (the ncu binary via the stored subprocess seam) or the default
// programmatic library path — and report whether all invocations succeeded.
// Runs inside the detached update continuation (no child process): ledger
// lines go through the FACTORY (State.Factory.Append); in bin mode the raw
// CLI output is additionally piped to the optional job ring (Emit, P1).
import Bin from "./Bin.js";
import Programmatic from "./Programmatic.js";
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";

export default async (
	State: State,
	Mode: string,
	Invocations: Invocation[],
	Root: string,
	Groups: string[],
	Concurrency: number,
	Reject: string[],
	Allow: string[] | undefined,
	Binary: string,
	Signal: AbortSignal,
	Emit?: (text: string) => void,
): Promise<boolean> => {
	let Ok = true;
	switch (true) {
		case Mode === "bin": {
			State.Factory.Append(State, `update: mode=bin (ncu binary ${Binary})`);
			for (const Call of Invocations) {
				switch (true) {
					case !(await Bin(
						State,
						Call,
						Binary,
						Root,
						Groups,
						Concurrency,
						Reject,
						Allow,
						Signal,
						Emit,
					)):
						Ok = false;
						break;
				}
			}
			break;
		}
		default: {
			State.Factory.Append(State, `update: mode=programmatic (npm-check-updates library)`);
			for (const Call of Invocations) {
				switch (true) {
					case !(await Programmatic(
						State,
						Call,
						Root,
						Groups,
						Concurrency,
						Reject,
						Allow,
					)):
						Ok = false;
						break;
				}
			}
		}
	}
	return Ok;
};
