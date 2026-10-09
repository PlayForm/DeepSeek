// Transform — the MODULE LEAF: the factory's transform contract
// (`(current, section, keep) => { next, count, message? } | null`) with the
// pinner's content step. The factory's Continue calls it exactly once per
// detached pass with the RAW file text (null when the read failed), the
// module's own `Section` state field and the UNION keep-list (the factory's
// ResolvePolicy — the pin-policy.json sidecars plus the P3 chain-keys
// interlock, so the governor's `^resolved` chain pins are never stripped).
//
// This module BUILDS the transform per pass: the contract carries no path,
// but the pinner's ledger strings are path-bearing — so the builder closes
// over the pass's target path and the State, and the returned function is the
// pure-ish leaf the factory drives. Every no-op/refusal line is the MODULE'S
// and is logged HERE, before returning null (the factory stays silent on
// no-op paths):
//
//   decode (Function/Decode — JSON.parse, null on any failure):
//     undecodable → `observed non-JSON package.json <path> — skipped` → null;
//   pin (Function/Pin — the range law: ONE leading ^/~/= stripped, statics/
//     wildcards/protocols/compound ranges untouched; already-pinned → null):
//     no change → `no changes to pin for <path>` → null;
//   REFUSAL GUARD (the defensive invariant absorbed from the old Rewrite):
//     only the config's dependency sections may differ from the author's
//     manifest — Function/Pin touches dependency sections by construction, so
//     this guard can never fire through the real flow; if the pinner's own
//     logic would EVER change a non-dependency section, the rewrite is
//     refused (`REFUSED rewrite of <path>: non-dependency section "<name>"
//     would change`) and null is returned — never applied.
//   otherwise → { next: the pinned manifest, count: the number of pinned
//     versions, message: `pinned <path> (<count> versions)` } — the factory
//     serializes the manifest exactly as the trio did (JSON.stringify(next,
//     null, 2) + "\n"), performs the guarded write (GuardedWrite:
//     replaceIfVersion + the P4 fence + Stash pre-registration), logs the
//     message and refreshes the observation-policy's record (same actor).
import type Factory from "@playform/dsh-plugin-factory";
import type State from "@Interface/State.js";
import Decode from "./Decode.js";
import Pin from "./Pin.js";
import { Refusal } from "@playform/hook-dsh-core";
import SectionDefault from "@Variable/Section.js";
import type Manifest from "@Interface/Manifest.js";

// The factory transform contract (the factory's Interface/Transform).
export default (Furnace: Factory, State: State, Path: string): Parameters<Factory["Continue"]>[6] =>
	(Current: string | null, Section: unknown, Keep: string[]) => {
		// Decode — an unreadable or non-JSON manifest maps to null (the caller
		// logs the "observed non-JSON" line below and the factory stays silent).
		const Document = Decode(Current);
		switch (true) {
			case !Document:
				Furnace.Append(State, `observed non-JSON package.json ${Path} — skipped`);
				return null;
		}
		// The dependency sections: the factory hands the module's own Section
		// state field through; an unmapped/foreign value falls back to the
		// built-in section list (the same default Function/Pin applies).
		const Sections = Array.isArray(Section) ? (Section as string[]) : SectionDefault;

		// The pin pass — the pure, deterministic, idempotent range law.
		const Outcome = Pin(Document as Manifest, Sections, Keep);
		switch (true) {
			case !Outcome: // no change — the designed no-op line, then silence
				Furnace.Append(State, `no changes to pin for ${Path}`);
				return null;
		}
		// Refusal guard: only the declared dependency sections may differ (the
		// CORE's Refusal — the byte-identical line, then null).
		switch (true) {
			case Refusal(
				(Message) => Furnace.Append(State, Message),
				Path,
				Sections,
				Document as Manifest,
				Outcome.Next,
			):
				return null;
		}
		// The successful rewrite: the factory serializes, writes, logs and
		// refreshes; the module owns the message string.
		return {
			next: Outcome.Next,
			count: Outcome.Pinned,
			message: `pinned ${Path} (${Outcome.Pinned} versions)`,
		};
	};
