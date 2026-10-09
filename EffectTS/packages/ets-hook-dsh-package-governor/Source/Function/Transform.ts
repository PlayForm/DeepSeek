// Transform — the MODULE LEAF of the factory continuation (SCHEME.md §3
// item 3): the chain pass of the fs/observed pipeline as a FACTORY TRANSFORM
// `(current, section, keep) => { next, count, message? } | null`. The
// factory's Continue (Function/Continue — SCHEME.md §2.9) owns everything
// around it: the Inflight registration, the `ctx.fs.readText`, the union
// keep-list (Factory.ResolvePolicy with the P3 chain keys — irrelevant to the
// governor's chain semantics and deliberately ignored here), the serialization
// (`JSON.stringify(next, null, 2) + "\n"` — the exact pre-refactor form), the
// version-guarded write (Factory.GuardedWrite: the P4 sandbox fence + Stash
// pre-registration), the message Append and the P₃ same-actor re-emit.
//
// This leaf keeps only what is governor-owned, byte-identically with the
// pre-refactor Function/Decode + Function/Satisfy + Function/Govern:
//
//   1. DECODE — `current` arrives as the RAW text (null when the read
//      failed); an undecodable package.json logs
//      `observed non-JSON package.json <path> — skipped` and returns null.
//   2. SATISFY — chain-governed pins (dep ∈ registry.effectiveLatest) are
//      canonicalized to `^<resolved>`; with `strict: true` unknown deps are
//      stripped; public deps are left for the update stage. Without a
//      registry (none found, or an unparsable one) the pass is skipped.
//   3. THE REFUSAL GUARD — only dependency sections (Variable/Section) may
//      differ from the author's manifest; anything else refuses the rewrite
//      outright: `REFUSED rewrite of <path>: non-dependency section "<name>"
//      would change`, and the update stage never runs (the guard's contract).
//
// On change the transform returns the governed manifest with the MODULE'S
// success line `governed <path> → <version>` as the message — composed inside
// the factory's post-write callback, which ALSO journals the `governed`
// storage record and marks the passage Proceed (a failed write never invokes
// the message, so the update stage is skipped exactly as the pre-refactor
// Function/Govern's false return did). The count is the change marker the
// factory's no-op gate needs (0 would suppress the write).
//
// The registry is passed in by Function/Observe — the SAME parsed object the
// listener's g2 stage checked for the `unreadable registry.json …` line — so
// the transform never re-reads it.
import Decode from "./Decode.js";
import Satisfy from "./Satisfy.js";
import { Refusal } from "@playform/ets-hook-dsh-core";
import Section from "@Variable/Section.js";
import type State from "@Interface/State.js";
import type Registry from "@Interface/Registry.js";
import type Passage from "@Interface/Passage.js";
import type { Transform } from "@Interface/Transform.js";
import type { FsTarget, FsVersion } from "@deepseek-ai/dsh-fs";

export default (
		State: State,
		Target: FsTarget,
		Registry: Registry | null,
		Passage: Passage,
	): Transform =>
	(Current: string | null, _Section: unknown, _Keep: string[]) => {
		// 1 — decode the raw text (the factory hands it over undecoded).
		const Decoded = Decode(Current);
		switch (true) {
			case !Decoded:
				State.Factory.Append(
					State,
					`observed non-JSON package.json ${Target.displayPath} — skipped`,
				);
				return null; // designed no-op — and no update stage (Proceed stays false)
		}
		Passage.Current = Decoded;

		// 2 — the chain pass (pure, idempotent): canonicalize governed pins.
		const Governed = Registry ? Satisfy(Decoded, Registry, State.Strict) : null;
		switch (true) {
			case !!Governed: {
				// 3 — the refusal guard: the governor can never restructure a file
				// (the CORE's Refusal — the byte-identical line, then null: a
				// refusal never proceeds to the update stage).
				switch (true) {
					case Refusal(
						(Message) => State.Factory.Append(State, Message),
						Target.displayPath,
						Section,
						Decoded,
						Governed,
					):
						return null;
				}
				return {
					next: Governed,
					count: 1,
					// The factory calls this only AFTER the guarded write succeeded;
					// the module's line and the P5 `governed` record are composed here,
					// and the passage opens for the update stage.
					message: ({ version }: { version: FsVersion }) => {
						Passage.Proceed = true;
						State.Factory.Journal(State, "governed", Target.displayPath, version);
						return `governed ${Target.displayPath} → ${version}`;
					},
				};
			}
		}

		// No chain change (or no registry): straight to the update stage, exactly
		// as the pre-refactor Function/Continue did after a null Satisfy.
		Passage.Proceed = true;
		return null;
	};
