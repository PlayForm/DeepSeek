// Verify — run the policy's verifyCommand after the bumps. Exit 127 is
// non-fatal: the command was not found because the child's PATH is not the
// user's shell PATH (pnpm etc. may be absent) — the bumps already landed and
// the lockfile/store catch-up can be run manually.
//
// The command runs through the subprocess seam stored on State (probed once
// by the factory's State builder, P9) — the seam never shell-interprets argv,
// so the shell command string is passed as `/bin/sh -c <command>` (same shell
// semantics as the old spawnSync(shell: true)). When the seam is absent
// (probed, optional — not an injected service), the node:child_process
// fallback runs INSIDE the detached continuation. The process management is
// not exempt — only the ncu binary/library is. Ledger lines go through the
// FACTORY (State.Factory.Append).
import * as ChildProcess from "node:child_process";
import type State from "@Interface/State.js";
// SubprocessService is the module's default export (dsh-subprocess 0.2.0-rc.2).
import type SubprocessService from "@deepseek-ai/dsh-subprocess";

export default async (
	State: State,
	Command: string,
	Root: string,
	Signal: AbortSignal,
): Promise<boolean> => {
	State.Factory.Append(State, `update: running verifyCommand: ${Command}`);
	// The subprocess seam is probed ONCE at State build (the factory's State
	// builder, P9) and stored on State — never a per-site accessor fallback (a
	// direct `State.Context.subprocess` access THROWS on service accessors
	// without inject — live-verified 2026-10-03).
	const Seam = State.Subprocess;
	switch (true) {
		case !!Seam && typeof Seam.spawn === "function":
			return ThroughSeam(State, Seam, Command, Root, Signal);
		default:
			return ThroughChild(State, Command, Root, Signal);
	}
};

// ThroughSeam: the confined spawn of `/bin/sh -c <command>`.
const ThroughSeam = async (
	State: State,
	Seam: SubprocessService,
	Command: string,
	Root: string,
	Signal: AbortSignal,
): Promise<boolean> => {
	try {
		const Outcome = await Seam.spawn({
			argv: ["/bin/sh", "-c", Command],
			cwd: Root,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: 1 << 20 },
				stderr: { maxBytes: 1 << 20 },
			},
			graceMs: 5000,
			signal: Signal ?? undefined,
		}).done;
		switch (true) {
			case Outcome.exitCode === 0:
				State.Factory.Append(State, `update: verifyCommand ok`);
				return true;
			case Outcome.exitCode === 127:
				// command not found (the host process PATH is not the user's
				// shell PATH — pnpm etc. may be absent). Non-fatal: the bumps
				// already landed; the catch-up can be run manually.
				State.Factory.Append(
					State,
					`update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal`,
				);
				return true;
			default:
				State.Factory.Append(
					State,
					`update: verifyCommand failed (status ${Outcome.exitCode})`,
				);
				return false;
		}
	} catch (Cause) {
		State.Factory.Append(
			State,
			`update: verifyCommand failed (status ${(Cause as Error)?.message ?? Cause})`,
		);
		return false;
	}
};

// ThroughChild: the fallback when no subprocess seam exists in this
// deployment. Async; the abort signal kills the child.
const ThroughChild = (
	State: State,
	Command: string,
	Root: string,
	Signal: AbortSignal,
): Promise<boolean> =>
	new Promise((Resolve) => {
		let Child: ChildProcess.ChildProcess;
		try {
			Child = ChildProcess.spawn(Command, {
				cwd: Root,
				stdio: "inherit",
				shell: true,
			});
		} catch (Cause) {
			State.Factory.Append(
				State,
				`update: verifyCommand failed (status ${(Cause as Error)?.message ?? Cause})`,
			);
			Resolve(false);
			return;
		}
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
				`update: verifyCommand failed (status ${(Cause as Error)?.message ?? Cause})`,
			);
			Resolve(false);
		});
		Child.on("close", (Status) => {
			switch (true) {
				case Status === 0:
					State.Factory.Append(State, `update: verifyCommand ok`);
					Resolve(true);
					break;
				case Status === 127:
					State.Factory.Append(
						State,
						`update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal`,
					);
					Resolve(true);
					break;
				default:
					State.Factory.Append(State, `update: verifyCommand failed (status ${Status})`);
					Resolve(false);
			}
		});
	});
