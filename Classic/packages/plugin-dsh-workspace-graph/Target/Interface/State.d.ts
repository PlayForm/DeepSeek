import type { Context } from "@deepseek-ai/cordis";
import type Configuration from "./Config.js";
import type Record from "./Record.js";
import type { Queue } from "@playform/lib-dsh-trace";
import type { Allowlist } from "@playform/plugin-dsh-factory";
/**
 * @module State
 *
 * The service's internal runtime state, built once per instance in the constructor (never
 * returned from apply - the loader treats apply return values specially).
 *
 * @remarks
 *
 * The state carries the owning context, the validated plain configuration, the in-memory
 * record mirror, the revision counter, the optional open storage-domain handle, the
 * pending-open promise (the constructor fires the open detached; the async writers await it so
 * the store assertions are deterministic), the optional durable ledger path (config `logFile`,
 * gated by config `log`; the empty default keeps the logger as the only surface), the
 * invalid-record counter (records skipped and counted, never guessed), the
 * skipped-import counter (non-relative import specifiers, recorded - not faked as nodes), and
 * the detached loop the trace adapter builds (the per-path coalescing queue: ONE in-flight
 * re-index per path, no timers - `State.Flush` is its flush promise).
 */
/**
 * The minimal structural view of an open storage-domain table (Store).
 */
export interface Table {
    get(key: string): unknown;
    entries(): IterableIterator<[string, unknown]>;
    keys(): IterableIterator<string>;
    readonly size: number;
    put(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<boolean>;
}
/**
 * The minimal structural view of an open storage-domain handle (Open).
 */
export interface Domain {
    readonly name: string;
    close(): Promise<void>;
    table(name: string): Table;
}
export default interface State {
    /**
     * The owning cordis context (the fiber that owns the service).
     */
    Context: Context;
    /**
     * The validated plain configuration (the frozen W1 table).
     */
    Config: Configuration;
    /**
     * The per-action allowlist (config `policy`, volatile) - the D6 block. Named `Allow`
     * because the factory's shared State already owns `Policy` (the configured global policy
     * file path). This package's actions are automatic; it has NO gated action.
     */
    Allow: Allowlist;
    /**
     * The LIVE enablement reader: the volatile `enabled` cell read at the moment of the
     * call (the raw cell's `get`, or the plain snapshot's value for a hand-built config).
     * Every disabled gate answers through this, never through the frozen `Config.enabled`,
     * so a flip acts on the very next call without a remount.
     */
    On: () => boolean;
    /**
     * The in-memory record mirror, keyed by the resolved display path.
     */
    Records: Map<string, Record>;
    /**
     * The plugin's own monotonic revision (never a wall clock) - the declared
     * counter the core births at the State build (`Function/Library` passes
     * the core's `Counter()`): `Value` is the read-only current number, `Next`
     * is the only way to advance, and `Restore` raises the value and never
     * lowers it (the in-memory value is the floor).
     */
    Revision: {
        readonly Value: number;
        Next(): number;
        Restore(Recovered: number): void;
    };
    /**
     * The open storage-domain handle, when a facility was present.
     */
    Domain?: Domain | undefined;
    /**
     * The pending storage open; the async writers await it first.
     */
    Opened?: Promise<void> | undefined;
    /**
     * The optional durable ledger path; empty means the logger only.
     */
    Ledger: string;
    /**
     * The count of stored records that failed validation and were skipped.
     */
    Invalid: number;
    /**
     * The count of non-relative import specifiers, recorded not faked as nodes.
     */
    SkippedImports: number;
    /**
     * The detached loop the trace adapter builds (undefined when no bus was present at
     * construction - the graph then hears no observation trace).
     */
    Loop?: Queue | undefined;
    /**
     * The latest detached re-index; the smoke awaits it (no sleep, no timer).
     */
    Flush: Promise<void>;
}
