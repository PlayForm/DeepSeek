// State - the per-apply plugin state: the FACTORY's shared shape (built by
// `Factory.State(ctx, config, { ... })` - factory SCHEME.md §2.10) extended
// with the CCR hook's own fields.
//
// The shared half comes from the factory's NAMED type export (`State`): the
// built Target/Library.d.ts ships RELATIVE specifiers, so a consumer's
// tsconfig paths never hijack the declaration imports. The shared
// machinery that stays inert here: Tool/Policy/PolicyName/List (no
// fs/observed machinery - the CCR hook is a NON-MANIFEST module), Stash/
// Inflight/Subprocess/Seams/Queue/Journal (no governance traffic; the only
// journal-domain line is the activation record, best-effort).
//
// The CCR hook's own fields:
//
//   Targets        - the allow-list of compressible tool names (config `targets`);
//   Exempt         - the never-compressed tools (config `exempt`);
//   Threshold      - the byte gate (config `thresholdBytes`, volatile);
//   InlineThreshold- the inline store ceiling (config `inlineThresholdBytes`);
//   AutoExpand     - store + preview but return full content under the limit;
//   AutoExpandLimit- the auto-expand ceiling in bytes;
//   Failures       - compress failing results too (config `compressFailures`);
//   Multipliers    - the per-type gate multipliers (config `multipliers`, volatile);
//   PreviewMax     - the hard preview character cap (config `previewMaxChars`, volatile);
//   Ttl            - store TTL in seconds (config `ttlSeconds`);
//   Budget         - the LRU budget in bytes (config `storeBudgetBytes`);
//   JournalPath    - the optional JSONL journal path (config `journalPath`; "" = memory-only);
//   Engine         - phase-4 context engine flag (config `contextEngine`,
//                    OFF by default);
//   EngineThresholdPct / ProtectFirst / ProtectLast - phase-4 knobs;
//   EngineRuntime  - the engine's runtime (turn cursor + observation log,
//                    Function/Engine), built only when the flag is on;
//   Store          - the LRU + TTL + journal store instance (Function/Store),
//                    built once in Function/Apply - never a module-level
//                    global, so HMR reloads rebind it cleanly;
//   Factory        - the injected factory service itself, consumed for the
//                    ledger (Factory.Append) - assigned once in Function/Apply.
//
// Test probes read the state through the `ctx.__ccrState` attachment (never a
// return value from `apply` - the loader treats apply returns specially, a
// live-verified lesson recorded in the plugin-development skill).
import type Factory from "@playform/plugin-dsh-factory";
import type { State as Shared } from "@playform/plugin-dsh-factory";

import type { EngineRuntime } from "../Function/Engine.js";
import type Store from "../Function/Store.js";
import type Config from "../Interface/Config.js";

export default interface State extends Shared {
	/** The allow-list of compressible tool names (config `targets`). */
	Targets: string[];
	/** The never-compressed tools (config `exempt`). */
	Exempt: string[];
	/** The byte gate (config `thresholdBytes`, volatile). */
	Threshold: number;
	/** The inline store ceiling (config `inlineThresholdBytes`). */
	InlineThreshold: number;
	/** Store + preview but return full content under the limit (config `autoExpand`). */
	AutoExpand: boolean;
	/** The auto-expand ceiling in bytes (config `autoExpandLimitBytes`). */
	AutoExpandLimit: number;
	/** Compress failing results too (config `compressFailures`). */
	Failures: boolean;
	/** The per-type gate multipliers (config `multipliers`, volatile). */
	Multipliers: Config["multipliers"];
	/** The hard preview character cap (config `previewMaxChars`, volatile). */
	PreviewMax: number;
	/** Store TTL in seconds (config `ttlSeconds`). */
	Ttl: number;
	/** The LRU budget in bytes (config `storeBudgetBytes`). */
	Budget: number;
	/** The optional JSONL journal path; "" = memory-only (config `journalPath`;
	 *  named JournalPath because the SHARED State already owns `Journal`, the
	 *  factory's P5 storage-domain writer). */
	JournalPath: string;
	/** Phase-4 context engine flag (config `contextEngine`); OFF by default -
	 *  when on, the `agent/pre-step` engine listener is registered. */
	Engine: boolean;
	/** Phase-4 context-usage threshold percent (config `contextEngineThresholdPct`). */
	EngineThresholdPct: number;
	/** Phase-4 protected head turns (config `protectFirstTurns`). */
	ProtectFirst: number;
	/** Phase-4 protected tail turns (config `protectLastTurns`). */
	ProtectLast: number;
	/** The phase-4 context-engine runtime (Function/Engine): the turn cursor
	 *  and the observation log. Built once in Function/Apply ONLY when the
	 *  engine flag is on - `undefined` means the engine is off (the default):
	 *  no listener, no observation, fully inert. */
	EngineRuntime?: EngineRuntime;
	/** The LRU + TTL + optional journal store (Function/Store), built once in Function/Apply. */
	Store: Store;
	/** The injected @playform/plugin-dsh-factory service - the ledger
	 *  (Factory.Append) is consumed through it; assigned once in Function/Apply. */
	Factory: Factory;
}
