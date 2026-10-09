// Child — the minimal fallback path of the cargo upgrade runner: used when
// no subprocess seam exists in this deployment. Async (the continuation owns
// the wait); the abort signal kills the child. The process management is not
// exempt — only the cargo CLI is.
import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import type Job from "@Interface/Job.js";
import * as ChildProcess from "node:child_process";
import Unavailable from "./Unavailable.js";

export default (
	Factory: PluginFactory,
	State: State,
	Binary: string,
	Argv: string[],
	Cwd: string,
	Invocation: Invocation,
	Signal: AbortSignal,
	Sink: Job | undefined,
): Promise<boolean> =>
	new Promise((Resolve) => {
		let Child: ChildProcess.ChildProcess;
		try {
			Child = ChildProcess.spawn(Binary, Argv, {
				cwd: Cwd,
				stdio: ["ignore", "pipe", "pipe"],
			});
		} catch (Cause) {
			Factory.Append(
				State,
				`update: cargo-edit unavailable: ${(Cause as Error)?.message ?? Cause}`,
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
			Factory.Append(
				State,
				`update: cargo-edit unavailable: ${(Cause as Error)?.message ?? Cause}`,
			);
			Resolve(false);
		});
		Child.on("close", (Status) => {
			Factory.Append(
				State,
				`update: cargo upgrade ${Argv.join(" ")} → ${JSON.stringify({
					exitCode: Status,
				})}`,
			);
			for (const Text of [Out, Err]) {
				switch (true) {
					case Text.length > 0: {
						// Same string to both sinks: the ledger (its asserted record)
						// and, when the run is a job, the job's live log IN ADDITION.
						const Line = Text.replace(/\n+$/, "");
						Factory.Append(State, Line);
						Sink?.append(Line);
						break;
					}
				}
			}
			switch (true) {
				case Status === 0:
					Resolve(true);
					break;
				case Unavailable(Out) || Unavailable(Err):
					Factory.Append(
						State,
						`update: cargo-edit unavailable: ${Out || Err}`.replace(/\s+/g, " ").trim(),
					);
					Resolve(false);
					break;
				default:
					Factory.Append(
						State,
						`update: cargo upgrade failed (${Invocation.label}) status ${Status}`,
					);
					Resolve(false);
			}
		});
	});
