import type Factory from "@playform/ets-plugin-dsh-factory";
import type { State as Shared } from "@playform/ets-plugin-dsh-factory";
import type { EngineRuntime } from "@Function/Engine.js";
import type Store from "@Function/Store.js";
import type Config from "@Interface/Config.js";
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
    /** The injected @playform/ets-plugin-dsh-factory service - the ledger
     *  (Factory.Append) is consumed through it; assigned once in Function/Apply. */
    Factory: Factory;
}
