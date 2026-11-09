/**
 * @module State
 *
 * The service's internal runtime state, built once per instance in the constructor (never
 * returned from apply - the loader treats apply return values specially).
 *
 * @remarks
 * The state carries the owning context, the validated plain configuration, the in-memory
 * record mirror, the revision counter, the optional open storage-domain handle, the
 * pending-open promise (the constructor fires the open detached; the async writers await it so
 * the store assertions are deterministic), the optional durable ledger path (settable through
 * the `__workspaceGraphState` probe; not a config field - the frozen config table has no
 * ledger knob), the invalid-record counter (records skipped and counted, never guessed), the
 * skipped-import counter (non-relative import specifiers, recorded - not faked as nodes), and
 * the detached loop the trace adapter builds (the per-path coalescing queue: ONE in-flight
 * re-index per path, no timers - `State.Flush` is its flush promise).
 */
import type { Context } from "@deepseek-ai/cordis";
import type Configuration from "@Interface/Config.js";
import type Record from "@Interface/Record.js";
import type { Queue } from "@playform/lib-dsh-trace";
import type { Allowlist } from "@playform/plugin-dsh-factory";

/** The minimal structural view of an open storage-domain table (Store). */
export interface Table {
	get(key: string): unknown;
	entries(): IterableIterator<[string, unknown]>;
	keys(): IterableIterator<string>;
	readonly size: number;
	put(key: string, value: unknown): Promise<void>;
	delete(key: string): Promise<boolean>;
}

/** The minimal structural view of an open storage-domain handle (Open). */
export interface Domain {
	readonly name: string;
	close(): Promise<void>;
	table(name: string): Table;
}

export default interface State {
	/** The owning cordis context (the fiber that owns the service). */
	Context: Context;
	/** The validated plain configuration (the frozen W1 table). */
	Config: Configuration;
	/**
	 * The per-action allowlist (config `policy`, volatile) - the D6 block. Named `Allow`
	 * because the factory's shared State already owns `Policy` (the configured global policy
	 * file path). This package's actions are automatic; it has NO gated action.
	 */
	Allow: Allowlist;
	/** The in-memory record mirror, keyed by the resolved display path. */
	Records: Map<string, Record>;
	/** The index revision counter, bumped by every store write. */
	Revision: number;
	/** The open storage-domain handle, when a facility was present. */
	Domain?: Domain | undefined;
	/** The pending storage open; the async writers await it first. */
	Opened?: Promise<void> | undefined;
	/** The optional durable ledger path; empty means the logger only. */
	Ledger: string;
	/** The count of stored records that failed validation and were skipped. */
	Invalid: number;
	/** The count of non-relative import specifiers, recorded not faked as nodes. */
	SkippedImports: number;
	/**
	 * The detached loop the trace adapter builds (undefined when no bus was present at
	 * construction - the graph then hears no observation trace).
	 */
	Loop?: Queue | undefined;
	/** The latest detached re-index; the smoke awaits it (no sleep, no timer). */
	Flush: Promise<void>;
}
