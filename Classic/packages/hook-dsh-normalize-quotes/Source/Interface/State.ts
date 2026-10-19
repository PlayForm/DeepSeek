// State — the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { … })` — factory SCHEME.md §2.10) extended
// with the quotes hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` — the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// factory runtime object always carried the full shared machinery:
// Tool/Policy/PolicyName/List/Stash/Inflight/Subprocess/Seams/Queue/Journal,
// all inert here — the quotes hook is not an fs/observed module — and the
// TYPE says so too).
//
// The quotes hook's own fields:
//
//   Reasoning   — normalize reasoning deltas/assembled blocks too (config
//                 `normalizeReasoning`);
//   ToolArgs    — normalize tool-call arguments too (config
//                 `normalizeToolArguments`; IMPLEMENTED — schema default
//                 OFF, this profile's patch yml enables it);
//   Scopes      — the granular scope gates (config `scopes`, the WHOLE
//                 object volatile — refreshed in place by the factory's P10
//                 volatile-update listener; optional because a hand-built
//                 config may omit it, the code falls back to the schema
//                 defaults);
//   Exempt      — the tool-results exemption list (config
//                 `toolResultsExempt`, volatile — same refresh path);
//   Overpass    — the one-shot step-batch overpass arm (set by the
//                 `normalize-overpass batch` command, consumed by the next
//                 incoming batch — Function/StepBatch);
//   Factory     — the injected factory service itself, consumed by Normalize
//                 (the post-loop ledger line) — assigned once in
//                 Function/Apply, never a module-level global, so HMR
//                 reloads rebind it cleanly.
//
// There is NO `Replacement` field: this is a MAP flavor — the substitution
// is the core's Quotes table (curly → straight), not a configured knob.
//
// Test probes read the state through the `ctx.__hookDshQuotesState` attachment
// (never a return value from `apply` — the loader treats apply returns
// specially, a live-verified lesson recorded in the plugin-development
// skill).
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scopes } from "@Interface/Config.js";

export default interface State extends Shared {
	/** Normalize reasoning deltas and the assembled reasoning block too. */
	Reasoning: boolean;
	/** Normalize tool-call arguments too (config `normalizeToolArguments`;
	 *  schema default OFF — this profile's patch yml enables it). */
	ToolArgs: boolean;
	/** The granular scope gates (config `scopes`, volatile — refreshed in
	 *  place by the factory's P10 volatile-update listener). */
	Scopes?: Scopes | undefined;
	/** The tool-results exemption list (config `toolResultsExempt`,
	 *  volatile — same refresh path). */
	Exempt?: string[] | undefined;
	/** The one-shot step-batch overpass arm (set by the
	 *  `normalize-overpass batch` command, consumed and cleared by the next
	 *  incoming batch regardless of the `scopes.batch` value — Function/
	 *  StepBatch). */
	Overpass?: boolean | undefined;
	/** The injected @playform/plugin-dsh-factory service — the ledger
	 *  (Factory.Append) is consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
}
