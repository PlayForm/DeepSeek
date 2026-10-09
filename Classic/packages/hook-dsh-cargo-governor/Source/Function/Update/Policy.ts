// Policy — update-stage policy resolution (data, not code) for the CARGO
// MODULE: the policy file (path resolved host-side by Function/Resolve) when
// given and readable, else the BUILT-IN DEFAULT (no rejects, all dependency
// tables, caret pinStyle, NO verifyCommand — never install implicitly).
//
// The `Quiet` form (used by Function/Transform BEFORE the update stage, when
// it needs the policy's pinStyle to drive the chain pass) skips the ledger
// lines — the built-in-default/no-policy diagnostics belong to the update
// job, exactly as in the package.json governor (Function/Run materializes
// non-quietly inside the detached continuation). The file may be read twice
// per cycle; both reads are best-effort.
//
// The built-in default mirrors cargo upgrade's own semantics: compatible
// upgrades allowed, incompatible upgrades IGNORED (the CLI default), pinned
// requirements ignored (the CLI default) — the module never widens the
// upgrade horizon implicitly.
//
// The read → fallback → diagnostic mechanics are the CORE's (the
// @playform/hook-dsh-core Policy loader — byte-identical lines, module-
// prefixed by the factory's Append); this module supplies the built-in
// default.
import { Policy } from "@playform/hook-dsh-core";
import type PluginFactory from "@playform/plugin-dsh-factory";
import type State from "@Interface/State.js";
import type PolicyShape from "@Interface/Policy.js";

export default (Factory: PluginFactory, State: State, File: string, Quiet = false): PolicyShape =>
	Policy(
		(Message) => Factory.Append(State, Message),
		File,
		{
			reject: [],
			depGroups: ["prod", "dev", "build"], // informational — no cargo equivalent
			pinStyle: "caret",
			incompatible: "ignore", // cargo upgrade's own default
			pinned: "ignore", // cargo upgrade's own default
			verifyCommand: null, // never install implicitly
		} as PolicyShape,
		Quiet,
	);
