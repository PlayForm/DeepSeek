// State - the service's internal runtime state, built once per instance in
// the constructor (never returned from apply - the loader treats apply
// return values specially): the owning context, the validated plain
// configuration, the in-memory record mirror, the revision counter, the
// optional open storage-domain handle, the pending-open promise (the
// constructor fires the open detached; the async writers await it so the
// store assertions are deterministic), the optional durable ledger path
// (settable through the __workspaceGraphState probe; not a config field -
// the frozen config table has no ledger knob), the invalid-record counter
// (records skipped and counted, never guessed) and the skipped-import
// counter (non-relative import specifiers, recorded - not faked as nodes).
import type { Context } from "@deepseek-ai/cordis";
import type Configuration from "@Interface/Config.js";
import type Record from "@Interface/Record.js";

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
	Context: Context;
	Config: Configuration;
	Records: Map<string, Record>;
	Revision: number;
	Domain?: Domain | undefined;
	Opened?: Promise<void> | undefined;
	Ledger: string;
	Invalid: number;
	SkippedImports: number;
}
