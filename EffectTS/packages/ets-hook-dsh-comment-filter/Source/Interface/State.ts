// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md section 2.10)
// extended with the comment filter's own fields.
//
// The shared half comes from the factory's NAMED type export (`State`): the
// built Target/Library.d.ts ships RELATIVE specifiers, so a consumer's
// tsconfig paths never hijack the declaration imports. The runtime object
// carries the full shared machinery (Tool/Policy/PolicyName/List/Stash/
// Inflight/Subprocess/Seams/Queue/Journal) - all inert here: the comment
// filter is a NON-MANIFEST module (no fs/observed machinery, no storage
// domain of its own; the Journal call is the core arm's shared `normalized`
// record, best-effort and a no-op without a storage facility).
//
// The comment filter's own fields:
//
//   Active    - the whole filter on/off (config `enabled`, volatile). It is
//               deliberately NOT named `Enabled`: the factory's shared
//               `Enabled` cell is the LEDGER gate (from `log`), and keeping
//               the two apart is what lets the activation line reach the
//               ledger while the filter itself is off - the family's "did it
//               activate is answerable from the ledger alone" contract.
//   Targets   - the tool names the filter may touch (config `targets`).
//   Exempt    - the tool names that always pass by identity (config
//               `exempt`; `read` and `ccr_retrieve` are ABSENT by design -
//               the deliberate opposite of the normalize flavors, which
//               exempt `read` as byte-contracted).
//   IntentOn  - consult the per-task intent gate (config `intent`).
//   Keywords  - the intent keywords (config `intentKeywords`).
//   Notice    - append the omission notice line (config `notice`).
//   IntentMap - agent object -> the last user text seen at agent/pre-step,
//               lowercased (the per-task intent stash). RUNTIME-ONLY, not a
//               config field: Function/Apply builds a fresh Map per apply.
//   Global    - the same text for calls whose `exec.agent` is absent (the
//               fallback). RUNTIME-ONLY, initialized to "" per apply.
//   Scopes    - THE CORE ADAPTER: the shared ToolResults arm factory reads
//               `State.Scopes.toolResults` as its own scope gate, and this
//               flavor has no scope vocabulary (its per-call Gate is the
//               single decision point), so Function/Apply pins the adapter
//               to `{ toolResults: true }` - the core gate stays OPEN and
//               the module Gate decides. RUNTIME-ONLY, not a config field.
//   Factory   - the injected factory service itself (the ledger sink the
//               core arm calls); assigned once in Function/Apply, never a
//               module-level global, so HMR reloads rebind it cleanly.
//
// Test probes read the state through the `ctx.__hookDshCommentFilterState`
// attachment (never a return value from `apply` - the loader treats apply
// returns specially, a live-verified lesson recorded in plugin-development).
import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";

/** The core arm factory's structural scope-gate view: the shared
 *  ToolResults machinery reads exactly this field, and the adapter pins it
 *  open (the module Gate is the only decision point in this flavor). */
export interface Scopes {
	toolResults: boolean;
}

export default interface State extends Shared {
	/** The whole filter on/off (config `enabled`, volatile). Distinct from
	 *  the shared `Enabled` (the ledger gate): the ledger keeps recording
	 *  while the filter is off. */
	Active: boolean;
	/** The tool names the filter may touch (config `targets`). */
	Targets: string[];
	/** The tool names that always pass by identity (config `exempt`;
	 *  `read`/`ccr_retrieve` are absent by design). */
	Exempt: string[];
	/** Consult the per-task intent gate (config `intent`). */
	IntentOn: boolean;
	/** The intent keywords (config `intentKeywords`). */
	Keywords: string[];
	/** Append the omission notice line (config `notice`). */
	Notice: boolean;
	/** agent -> the last user text at agent/pre-step, lowercased (runtime). */
	IntentMap: Map<object, string>;
	/** The same text when `exec.agent` is absent (runtime fallback). */
	Global: string;
	/** The core arm factory's scope-gate adapter, pinned open (runtime). */
	Scopes: Scopes;
	/** The injected @playform/ets-plugin-dsh-factory service - the ledger sink. */
	Factory: Factory;
}
