// Bin — bin mode: the ncu binary with policy-derived CLI args (the original
// path). ncu's -x/--reject and -a/--allow take ONE comma-or-space-delimited
// argument; separate argv entries become positional FILTERS (ncu scans only
// those packages) — verified ncu 23.0.0, 2026-10-02.
//
// The binary is spawned through the SUBPROCESS SEAM stored on State
// (`State.Subprocess` — probed ONCE at apply via `ctx.get("subprocess")`,
// P9; a direct accessor fallback would throw on service accessors without
// inject, live-verified 2026-10-03). SubprocessSpawnSpec — argv never
// shell-interpreted, collect-mode stdio, owned abort signal;
// docs/subsystems/subprocess.md. The binary path is verified/resolved
// through the seam's resolveExecutable first. When the seam is absent (not
// an injected service — it is probed, optional), a minimal node:child_process
// fallback runs INSIDE the detached continuation: the exemption covers the
// ncu binary itself, never process management as a design choice. The
// npm-check-updates binary is the second standing exemption.
//
// Output: the collected stdout/stderr text is appended to the ledger by US
// (the old child inherited the ledger fd) AND, in jobs mode (P1), piped raw
// into the harness job's output ring via the Emit pipe.
//
// The granularized units (one definition per file, Update/Bin/): Seam (the
// confined spawn path), Child (the child-process fallback), Pipe (the
// ledger+ring pipe) and Collect (the stream reader) — the same role names
// the cargo governor's Upgrade split uses (the naming unification, P4).
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import Seam from "./Bin/Seam.js";
import Child from "./Bin/Child.js";

export default async (
	State: State,
	Invocation: Invocation,
	Binary: string,
	Root: string,
	Groups: string[],
	Concurrency: number,
	Reject: string[],
	Allow: string[] | undefined,
	Signal: AbortSignal,
	Emit?: (text: string) => void,
): Promise<boolean> => {
	const Argv = [
		"-u",
		"--dep",
		Groups.join(","),
		"--concurrency",
		String(Concurrency),
		...(Reject.length ? ["-x", Reject.join(",")] : []),
		...(Allow ? ["-a", Allow.join(",")] : []),
		"--target",
		Invocation.target,
		...(Invocation.filter ? ["-f", Invocation.filter] : []),
	];
	const SeamRef = State.Subprocess;
	switch (true) {
		case !!SeamRef && typeof SeamRef.spawn === "function":
			return Seam(State, SeamRef, Invocation, Binary, Root, Argv, Signal, Emit);
		default:
			return Child(State, Invocation, Binary, Root, Argv, Signal, Emit);
	}
};
