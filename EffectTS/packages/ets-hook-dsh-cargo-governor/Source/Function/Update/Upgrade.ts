// Upgrade — the update stage's Rust/TS boundary: the cargo CLI (cargo-edit's
// `cargo upgrade`) driven through the `ctx.subprocess` seam with a
// fully-specified argv (never shell-interpreted, collect-mode stdio, owned
// abort signal — docs/subsystems/subprocess.md), exactly as the package.json
// governor drives ncu in bin mode. Rust does not co-opt into the TypeScript
// ecosystem — there is no npm-library equivalent for cargo manifest updates —
// so the CLI is the ONLY update path, at the exclusionary level.
//
// THE EXCLUSIONARY LEVEL: the reject/exclusion list is enforced AT THE CLI
// LEVEL via `--exclude <crate>`, ONE argv pair per crate (verified live,
// cargo-edit 0.13.13: the flag is repeatable and the COMMA form is silently
// IGNORED — the exact opposite of ncu's one-comma-argument reject list, which
// is why this module can't reuse the parent's argv builder). The chain deps
// are always merged into the list (the cordis-trap analog: cargo upgrade must
// never bump a chain-governed pin).
//
// Policy mapping (Interface/Policy.ts has the full table):
//   reject  → --exclude <crate> (per crate)   allow → -p <crate> (per crate)
//   incompatible → --incompatible <allow|ignore>
//   pinned  → --pinned <allow|ignore>         compatible → --compatible <…>
//   depGroups/targets/concurrency → no cargo-edit equivalent (ignored)
//   pinStyle → no --exact flag exists; manifest-level (chain pass) instead.
//
// GRACEFUL NO-CARGO-EDIT PATH: when the binary can't be resolved (spawn
// ENOENT) or cargo answers "no such command: upgrade" (exit 101 — cargo
// installed, cargo-edit absent), the ledger gets
// `update: cargo-edit unavailable: …` and the stage fails gracefully (the
// breaker counts it; the verifyCommand path still exists for configured
// policies — Function/Verify).
//
// Output is appended to the ledger by US (collect-mode: the child's streams
// are read back through Handle.collected); the digest line is
// `update: cargo upgrade <args> → {"exitCode":N}`. The ledger lines go
// through the FACTORY's Append (State.Module supplies the "hook-dsh-governor-cargo"
// prefix — the strings stay the module's).
//
// The granularized units (one definition per file, Update/Upgrade/):
// Unavailable (the graceful no-cargo-edit detector), Seam (the confined
// spawn path), Child (the child-process fallback) and Collect (the stream
// reader) — the same role names the package.json governor's Bin split uses
// (the naming unification, P4).
import type PluginFactory from "@playform/ets-dsh-plugin-factory";
import type State from "@Interface/State.js";
import type Invocation from "@Interface/Invocation.js";
import type Policy from "@Interface/Policy.js";
import type Job from "@Interface/Job.js";
import Seam from "./Upgrade/Seam.js";
import Child from "./Upgrade/Child.js";

export default async (
	Factory: PluginFactory,
	State: State,
	Binary: string,
	ManifestPath: string,
	Cwd: string,
	Invocation: Invocation,
	Chosen: Policy,
	Signal: AbortSignal,
	// The probed jobs runtime's live log (Function/Run): the cargo CLI
	// output is appended to it IN ADDITION to the ledger digest lines.
	Sink: Job | undefined,
): Promise<boolean> => {
	const Flags: string[] = ["--manifest-path", ManifestPath];
	for (const Crate of Invocation.exclude) {
		Flags.push("--exclude", Crate); // ONE pair per crate — the comma form is ignored
	}
	switch (true) {
		case !!Invocation.allow:
			for (const Crate of Invocation.allow) {
				Flags.push("-p", Crate);
			}
			break;
	}
	// Three INDEPENDENT policy flags — each its own switch (true) guard: one
	// combined switch would push only the first matching flag (the policy may
	// set compatible, incompatible AND pinned at once).
	switch (true) {
		case !!Chosen.compatible:
			Flags.push("--compatible", Chosen.compatible);
			break;
	}
	switch (true) {
		case !!Chosen.incompatible:
			Flags.push("--incompatible", Chosen.incompatible);
			break;
	}
	switch (true) {
		case !!Chosen.pinned:
			Flags.push("--pinned", Chosen.pinned);
			break;
	}
	const Argv = ["upgrade", ...Flags];
	// The subprocess seam is OPTIONAL — probed ONCE at State build time (the
	// FACTORY's State builder: Function/Seam's ctx.get("subprocess") — the
	// documented optional-dep probe; the direct accessor is not a fallback, it
	// THROWS on the live root context) and consumed from State here.
	// Undefined → the node:child_process fallback.
	const SeamRef = State.Subprocess;
	switch (true) {
		case !!SeamRef && typeof SeamRef.spawn === "function":
			return Seam(Factory, State, SeamRef, Binary, Argv, Cwd, Invocation, Signal, Sink);
		default:
			return Child(Factory, State, Binary, Argv, Cwd, Invocation, Signal, Sink);
	}
};
