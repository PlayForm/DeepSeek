// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the file-content normalizer's own fields.
//
// The shared half comes from the factory's NAMED type export (`State` - the
// factory v0.1.1 declaration fix): the built Target/Library.d.ts ships
// RELATIVE specifiers now, so a consumer's tsconfig paths never hijack the
// declaration imports, and the extracted shared shape is the real one (the
// factory runtime object always carried the full shared machinery:
// Tool/Policy/PolicyName/List/Stash/Inflight/Subprocess/Seams/Queue/Journal,
// all inert here - the file-content normalizer is not an fs/observed module -
// and the TYPE says so too).
//
// The normalizer's own fields:
//
//   Replacement - the dash replacement (config `replacement`, volatile -
//                 the transform's only knob);
//   Scopes      - the granular scope gates (config `scopes`, the WHOLE
//                 object volatile - refreshed in place by the factory's P10
//                 volatile-update listener; only `files` is consumed by this
//                 flavor; optional because a hand-built config may omit it,
//                 the code falls back to the schema defaults);
//   Exempt      - the tool-results exemption list (config
//                 `toolResultsExempt`, volatile - same refresh path);
//   Factory     - the injected factory service itself, consumed by the tool
//                 (the ledger Append, the Journal record and the ONE shared
//                 write executor `Factory.Write` are consumed through it) -
//                 assigned once in Function/Apply, never a module-level
//                 global, so HMR reloads rebind it cleanly.
//
// There are NO Reasoning/ToolArgs fields: the tool registers NO event
// listener (the family's first listener-less flavor), so there is no stream
// dispatch to gate - the six-fold chain is applied whole, at write time.
//
// Test probes read the state through the `ctx.__hookDshNormalizeFileState`
// attachment (never a return value from `apply` - the loader treats apply
// returns specially, a live-verified lesson recorded in the plugin-development
// skill).
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";
import type { Scopes } from "@Interface/Config.js";

export default interface State extends Shared {
	/** The dash replacement - the transform's only knob (config `replacement`). */
	Replacement: string;
	/** The granular scope gates (config `scopes`, volatile - refreshed in
	 *  place by the factory's P10 volatile-update listener; only `files` is
	 *  consumed by this flavor). */
	Scopes?: Scopes | undefined;
	/** The tool-results exemption list (config `toolResultsExempt`,
	 *  volatile - same refresh path). */
	Exempt?: string[] | undefined;
	/** The injected @playform/plugin-dsh-factory service - the ledger
	 *  (Factory.Append), the P5 journal (Factory.Journal) and the ONE shared
	 *  write executor (Factory.Write) are consumed through it; assigned once in
	 *  Function/Apply. */
	Factory: Factory;
}
