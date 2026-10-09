// Policy — update-stage policy resolution (data, not code): the policy file
// (path resolved host-side by Function/Resolve) when given and readable, else
// the BUILT-IN DEFAULT (reject the learned tailwindcss exception, all dep
// groups, concurrency 8, target latest, NO verifyCommand — never install
// implicitly). Runs in-process inside the detached update continuation; its
// ledger lines go through the FACTORY (State.Factory.Append). The policy file
// read stays a plain fs read — an auxiliary configuration file, part of the
// registry/policy discovery exemption.
//
// FIRST-WINS, module-owned: this is the ENGINE INPUT path pick (Function/
// Resolve) — deliberately NOT the factory's union keep-list discovery
// (Factory.ResolvePolicy), which composes every readable sidecar for the
// transform's keep-list. The update policy selects HOW ncu runs; it never
// protects chain pins (the cordis-trap guard already merges them into the
// reject list in Function/Execute).
//
// The read → fallback → diagnostic mechanics are the CORE's (the
// @playform/hook-dsh-core Policy loader — byte-identical lines, module-
// prefixed by the factory's Append); this module supplies the built-in
// default.
import { Policy } from "@playform/hook-dsh-core";
import type State from "@Interface/State.js";
import type PolicyShape from "@Interface/Policy.js";

export default (State: State, File: string): PolicyShape =>
	Policy((Message) => State.Factory.Append(State, Message), File, {
		reject: ["tailwindcss"], // learned exception
		depGroups: ["dev", "optional", "peer", "prod", "bundle"],
		concurrency: 8,
		targets: { default: "latest", overrides: [] },
		verifyCommand: null, // never install implicitly
	} as PolicyShape);
