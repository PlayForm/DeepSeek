// Resolve — the UNION KEEP-LIST policy discovery (Function/ResolvePolicy in
// the service API). Order (the pinner's priority, parameterized by the policy
// sidecar file name): the configured global policy file (State.Policy via
// `policyFileField`) → the governed file's own directory → co-located with
// the discovered registry.json (if any) → and ALWAYS the P3 chain-keys union:
// the chain-governed names from the discovered registry (the registry's
// `effectiveLatest` keys, passed in as `chain`) are part of the keep-list.
// The chain pins must never be stripped by a module's transform — the
// governor canonicalizes chain pins to `^resolved`; if the pinner stripped
// that `^`, each plugin would consume the other's fresh version token forever
// (an infinite rewrite ping-pong). With the chain names kept, the modules
// leave them alone and the pass terminates.
//
// Unlike a first-wins path pick, the effective keep-list is the UNION of
// every readable discovered policy: a global rule ("keep tailwindcss")
// composes with a per-directory rule ("keep left-pad") instead of one
// shadowing the other. A configured-but-ABSENT file is simply not a source; a
// file that EXISTS but does not parse is logged (`unreadable <policyFileName>
// at … — using built-in default`) and contributes nothing — the line is
// PARAMETERIZED MACHINERY (the file name is the only variable), not module
// vocabulary, so centralizing it keeps the trio's output byte-identical.
//
// Exemption (documented): existsSync probes + plain reads of auxiliary
// discovery files only (policy sidecars) — part of the policy-discovery
// calculation, same exemption as Function/Discover. The governed manifest is
// never touched here.
import * as FileSystem from "node:fs";
import { join as Join, dirname as Parent } from "node:path";
import { Append } from "@playform/ets-dsh-hook";
import Parse from "./Parse.js";
import type { State as State } from "@playform/ets-dsh-hook";

export default (
	State: State,
	Dir: string,
	Found: string | null,
	Chain: string[],
	Options?: { policyFileField?: string; policyFileName?: string } | undefined,
): string[] => {
	const Field = Options?.policyFileField ?? "Policy";
	const Name = Options?.policyFileName ?? State.PolicyName;
	const Global = (State as unknown as Record<string, unknown>)[Field] as string | undefined;
	const Keep: string[] = [];
	const Absorb = (Path: string): void => {
		const Discovered = Parse(Path) as
			{ keep?: unknown[] } | Record<string, unknown> | unknown[] | null;
		switch (true) {
			case !Discovered || typeof Discovered !== "object" || Array.isArray(Discovered):
				Append(State, `unreadable ${Name} at ${Path} — using built-in default`);
				return;
		}
		for (const Item of (Discovered as { keep?: unknown[] }).keep ?? []) {
			switch (true) {
				case typeof Item === "string" && !Keep.includes(Item):
					Keep.push(Item);
					break;
			}
		}
	};
	switch (true) {
		case !!Name && !!Global && FileSystem.existsSync(Global):
			Absorb(Global);
			break;
	}
	switch (true) {
		case !!Name && FileSystem.existsSync(Join(Dir, Name)):
			Absorb(Join(Dir, Name));
			break;
	}
	switch (true) {
		case !!Name && !!Found && FileSystem.existsSync(Join(Parent(Found), Name)):
			Absorb(Join(Parent(Found), Name));
			break;
	}
	// P3 — chain-governed names are always protected (see header).
	for (const Item of Chain) {
		switch (true) {
			case !Keep.includes(Item):
				Keep.push(Item);
				break;
		}
	}
	return Keep;
};
