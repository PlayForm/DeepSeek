// Child — the minimal fallback path of the bin-mode runner: used when no
// subprocess seam exists in this deployment. Async (the continuation owns
// the wait); the abort signal kills the child.
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import * as ChildProcess from "node:child_process";
import Pipe from "./Pipe.js";

export default (
	State: State,
	Invocation: Invocation,
	Binary: string,
	Root: string,
	Argv: string[],
	Signal: AbortSignal,
	Emit?: (text: string) => void,
): Promise<boolean> =>
	new Promise((Resolve) => {
		let Child: ChildProcess.ChildProcess;
		try {
			Child = ChildProcess.spawn(Binary, Argv, {
				cwd: Root,
				stdio: ["ignore", "pipe", "pipe"],
			});
		} catch (Cause) {
			State.Factory.Append(
				State,
				`update: ncu failed (${Invocation.label}): ${(Cause as Error)?.message ?? Cause}`,
			);
			Resolve(false);
			return;
		}
		let Out = "";
		let Err = "";
		Child.stdout?.on("data", (Chunk) => {
			Out += Chunk;
		});
		Child.stderr?.on("data", (Chunk) => {
			Err += Chunk;
		});
		Signal.addEventListener(
			"abort",
			() => {
				try {
					Child.kill();
				} catch {
					/* already gone */
				}
			},
			{ once: true },
		);
		Child.on("error", (Cause) => {
			State.Factory.Append(
				State,
				`update: ncu failed (${Invocation.label}): ${(Cause as Error)?.message ?? Cause}`,
			);
			Resolve(false);
		});
		Child.on("close", (Status) => {
			for (const Text of [Out, Err]) {
				switch (true) {
					case Text.length > 0:
						Pipe(State, Text.replace(/\n+$/, ""), Emit);
						break;
				}
			}
			switch (true) {
				case Status !== 0:
					State.Factory.Append(
						State,
						`update: ncu failed (${Invocation.label}) status ${Status}`,
					);
					Resolve(false);
					break;
				default:
					Resolve(true);
			}
		});
	});
