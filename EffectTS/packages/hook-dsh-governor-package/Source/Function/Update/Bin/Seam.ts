// Seam — the confined spawn path of the bin-mode runner: the binary path is
// verified/resolved through the seam's resolveExecutable first (the host
// PATH is not the user's shell PATH); a spawn/provider failure rejects
// Handle.done — mapped to the same ledger line the old spawnSync error
// branch produced.
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";
import Collect from "./Collect.js";

export default async (
	State: State,
	Seam: SubprocessService,
	Invocation: Invocation,
	Binary: string,
	Root: string,
	Argv: string[],
	Signal: AbortSignal,
	Emit?: (text: string) => void,
): Promise<boolean> => {
	let Command = Binary;
	try {
		switch (true) {
			case typeof Seam.resolveExecutable === "function":
				Command = await Seam.resolveExecutable(Binary);
				break;
		}
	} catch {
		/* keep the configured path */
	}
	try {
		const Handle = Seam.spawn({
			argv: [Command, ...Argv],
			cwd: Root,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: 1 << 20 },
				stderr: { maxBytes: 1 << 20 },
			},
			graceMs: 5000,
			signal: Signal ?? undefined,
		});
		const Outcome = await Handle.done;
		Collect(State, Handle, "stdout", Emit);
		Collect(State, Handle, "stderr", Emit);
		switch (true) {
			case Outcome.exitCode !== 0:
				State.Factory.Append(
					State,
					`update: ncu failed (${Invocation.label}) status ${Outcome.exitCode}`,
				);
				return false;
			default:
				return true;
		}
	} catch (Cause) {
		State.Factory.Append(
			State,
			`update: ncu failed (${Invocation.label}): ${(Cause as Error)?.message ?? Cause}`,
		);
		return false;
	}
};
