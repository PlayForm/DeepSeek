// Resolve — host-side update-policy path resolution for the CARGO FLAVOR.
// Order: the configured global policyFile → the file's own directory →
// co-located with the discovered registry → "" (the built-in default,
// handled inside the update job when no policy file resolves). The policy
// SHAPE is the cargo one (Interface/Policy.ts) — same discovery as the
// package.json governor, separate policy content.
//
// Exemption (documented): `existsSync` probes on auxiliary discovery files
// only (update-policy.json sidecars) — part of the policy-discovery
// calculation, same exemption as Function/Discover. The governed manifest is
// never touched here.
import * as FileSystem from "node:fs";
import { join as Join, dirname as Parent } from "node:path";
import type State from "@Interface/State.js";

export default (State: State, Dir: string, Found: string | null): string => {
	switch (true) {
		case !!State.Policy && FileSystem.existsSync(State.Policy):
			return State.Policy;
		case FileSystem.existsSync(Join(Dir, "update-policy.json")):
			return Join(Dir, "update-policy.json");
		case !!Found && FileSystem.existsSync(Join(Parent(Found), "update-policy.json")):
			return Join(Parent(Found), "update-policy.json");
		default:
			return "";
	}
};
