// Seam — the confined spawn path of the cargo upgrade runner: the binary
// path is verified/resolved through the seam's resolveExecutable first (the
// host PATH is not the user's shell PATH); a spawn/provider failure rejects
// Handle.done — mapped to the graceful unavailable path.
import type PluginFactory from "@playform/dsh-plugin-factory";
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import type Job from "@Interface/Job.js";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import Unavailable from "./Unavailable.js";
import Collect from "./Collect.js";

export default async (
	Factory: PluginFactory,
	State: State,
	Seam: SubprocessService,
	Binary: string,
	Argv: string[],
	Cwd: string,
	Invocation: Invocation,
	Signal: AbortSignal,
	Sink: Job | undefined,
): Promise<boolean> => {
	let Command = Binary;
	try {
		switch (true) {
			case typeof Seam.resolveExecutable === "function":
				Command = await Seam.resolveExecutable(Binary);
				break;
		}
	} catch (Cause) {
		Factory.Append(
			State,
			`update: cargo-edit unavailable: resolveExecutable(${Binary}) failed: ${(Cause as Error)?.message ?? Cause}`,
		);
		return false;
	}
	try {
		const Handle = Seam.spawn({
			argv: [Command, ...Argv],
			cwd: Cwd,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: 1 << 20 },
				stderr: { maxBytes: 1 << 20 },
			},
			graceMs: 5000,
			signal: Signal ?? undefined,
		});
		const Outcome = await Handle.done;
		const Out = Collect(Handle, "stdout");
		const Err = Collect(Handle, "stderr");
		Factory.Append(
			State,
			`update: cargo upgrade ${Argv.join(" ")} → ${JSON.stringify({
				exitCode: Outcome.exitCode,
			})}`,
		);
		for (const Text of [Out, Err]) {
			switch (true) {
				case Text.length > 0: {
					// Same string to both sinks: the ledger (its asserted record) and,
					// when the run is a job, the job's live log IN ADDITION.
					const Line = Text.replace(/\n+$/, "");
					Factory.Append(State, Line);
					Sink?.append(Line);
					break;
				}
			}
		}
		switch (true) {
			case Outcome.exitCode === 0:
				return true;
			case Unavailable(Out) || Unavailable(Err):
				Factory.Append(
					State,
					`update: cargo-edit unavailable: ${Out || Err}`.replace(/\s+/g, " ").trim(),
				);
				return false;
			default:
				Factory.Append(
					State,
					`update: cargo upgrade failed (${Invocation.label}) status ${Outcome.exitCode}`,
				);
				return false;
		}
	} catch (Cause) {
		Factory.Append(
			State,
			`update: cargo-edit unavailable: ${(Cause as Error)?.message ?? Cause}`,
		);
		return false;
	}
};
