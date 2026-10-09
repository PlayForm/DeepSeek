// State — the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { … })` — factory SCHEME.md §2.10) extended
// with the invisible hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` — the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// full shared machinery — Tool/Policy/PolicyName/List/Stash/Inflight/
// Subprocess/Seams/Queue/Journal — is all inert here: the invisible hook is
// not an fs/observed module).
//
// The invisible hook's own fields:
//
//   Replacement — the replacement string (config `replacement`, volatile —
//                 the transform's only knob; default "" — REMOVAL);
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
// Test probes read the state through the `ctx.__hookDshInvisibleState` attachment
// (never a return value from `apply` — the loader treats apply returns
// specially, a live-verified lesson recorded in the plugin-development
// skill).
import type Factory from "@playform/dsh-plugin-factory";
import type { State as Shared } from "@playform/dsh-plugin-factory";

export default interface State extends Shared {
	/** The replacement string — the transform's only knob, default "" —
	 *  REMOVAL (config `replacement`). */
	Replacement: string;
	/** Normalize reasoning deltas and the assembled reasoning block too. */
	Reasoning: boolean;
	/** Normalize tool-call arguments too (config `normalizeToolArguments`;
	 *  schema default OFF — this profile's patch yml enables it). */
	ToolArgs: boolean;
	/** The injected @playform/dsh-plugin-factory service — the ledger
	 *  (Factory.Append) is consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
}
