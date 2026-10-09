// State — the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { … })` — factory SCHEME.md §2.10) extended
// with the fullwidth hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` — the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// factory runtime object always carried the full shared machinery:
// Tool/Policy/PolicyName/List/Stash/Inflight/Subprocess/Seams/Queue/Journal,
// all inert here — the fullwidth hook is not an fs/observed module — and the
// TYPE says so too).
//
// The fullwidth hook's own fields:
//
//   Reasoning   — normalize reasoning deltas/assembled blocks too (config
//                 `normalizeReasoning`);
//   ToolArgs    — normalize tool-call arguments too (config
//                 `normalizeToolArguments`; IMPLEMENTED — schema default
//                 OFF, this profile's patch yml enables it);
//   Factory     — the injected factory service itself, consumed by Normalize
//                 (the post-loop ledger line) — assigned once in
//                 Function/Apply, never a module-level global, so HMR
//                 reloads rebind it cleanly.
//
// There is NO `Replacement` field: this is a MAP flavor — the substitution
// is the core's Fullwidth table (full-width → half-width), not a configured
// knob.
//
// Test probes read the state through the `ctx.__hookDshFullwidthState` attachment
// (never a return value from `apply` — the loader treats apply returns
// specially, a live-verified lesson recorded in the plugin-development
// skill).
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";

export default interface State extends Shared {
	/** Normalize reasoning deltas and the assembled reasoning block too. */
	Reasoning: boolean;
	/** Normalize tool-call arguments too (config `normalizeToolArguments`;
	 *  schema default OFF — this profile's patch yml enables it). */
	ToolArgs: boolean;
	/** The injected @playform/plugin-dsh-factory service — the ledger
	 *  (Factory.Append) is consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
}
