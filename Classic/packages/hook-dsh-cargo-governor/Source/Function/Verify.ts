// Verify — run the policy's verifyCommand after the cargo upgrade (e.g.
// `cargo check`). Exit 127 is non-fatal: the command was not found because
// the child's PATH is not the user's shell PATH (cargo etc. may be absent) —
// the bumps already landed and the lockfile/target catch-up can be run
// manually.
//
// The command runs through the `ctx.subprocess` seam when available — the
// seam never shell-interprets argv, so the shell command string is passed as
// `/bin/sh -c <command>` (same shell semantics as the package.json governor's
// verify stage). The seam is OPTIONAL — probed ONCE at State build time (the
// FACTORY's State builder: Function/Seam's ctx.get("subprocess") — the
// documented optional-dep probe; the direct accessor is not a fallback, it
// THROWS on the live root context) and consumed from State here. Undefined →
// the node:child_process fallback runs INSIDE the detached continuation. The
// process management is not exempt — only the cargo CLI is.
//
// The ledger lines go through the FACTORY's Append (State.Module supplies
// the "hook-dsh-governor-cargo" prefix — the strings stay the module's).
import * as ChildProcess from "node:child_process";
import type PluginFactory from "@playform/dsh-plugin-factory";
import type State from "@Interface/State.js";
import type SubprocessService from "@deepseek-ai/dsh-subprocess";

export default async (
	Factory: PluginFactory,
	State: State,
	Command: string,
	Root: string,
	Signal: AbortSignal,
): Promise<boolean> => {
	Factory.Append(State, `update: running verifyCommand: ${Command}`);
	// The subprocess seam is OPTIONAL — see the header (probed ONCE by the
	// factory's State builder, consumed from State here). Undefined → the
	// node:child_process fallback below.
	const Seam = State.Subprocess;
	switch (true) {
		case !!Seam && typeof Seam.spawn === "function":
			return ThroughSeam(Factory, State, Seam, Command, Root, Signal);
		default:
			return ThroughChild(Factory, State, Command, Root, Signal);
	}
};

// ThroughSeam: the confined spawn of `/bin/sh -c <command>`.
const ThroughSeam = async (
	Factory: PluginFactory,
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
				Factory.Append(State, `update: verifyCommand ok`);
				return true;
			case Outcome.exitCode === 127:
				// command not found (the host process PATH is not the user's
				// shell PATH). Non-fatal: the bumps already landed; the catch-up
				// can be run manually.
				Factory.Append(
					State,
					`update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal`,
				);
				return true;
			default:
				Factory.Append(State, `update: verifyCommand failed (status ${Outcome.exitCode})`);
				return false;
		}
	} catch (Cause) {
		Factory.Append(
			State,
			`update: verifyCommand failed (status ${(Cause as Error)?.message ?? Cause})`,
		);
		return false;
	}
};

// ThroughChild: the fallback when no subprocess seam exists in this
// deployment. Async; the abort signal kills the child.
const ThroughChild = (
	Factory: PluginFactory,
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
			Factory.Append(
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
			Factory.Append(
				State,
				`update: verifyCommand failed (status ${(Cause as Error)?.message ?? Cause})`,
			);
			Resolve(false);
		});
		Child.on("close", (Status) => {
			switch (true) {
				case Status === 0:
					Factory.Append(State, `update: verifyCommand ok`);
					Resolve(true);
					break;
				case Status === 127:
					Factory.Append(
						State,
						`update: verifyCommand runner unavailable (exit 127) — skipped, non-fatal`,
					);
					Resolve(true);
					break;
				default:
					Factory.Append(State, `update: verifyCommand failed (status ${Status})`);
					Resolve(false);
			}
		});
	});
