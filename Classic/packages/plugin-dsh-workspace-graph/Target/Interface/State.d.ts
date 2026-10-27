import type { Context } from "@deepseek-ai/cordis";
import type Configuration from "./Config.js";
import type Record from "./Record.js";
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
    Context: Context;
    Config: Configuration;
    /** The per-action allowlist (config `policy`, volatile) - the D6 block.
     *  Named `Allow` because the factory's shared State already owns `Policy`
     *  (the configured global policy file path). This package's actions are
     *  automatic; it has NO gated action. */
    Allow: Allowlist;
    Records: Map<string, Record>;
    Revision: number;
    Domain?: Domain | undefined;
    Opened?: Promise<void> | undefined;
    Ledger: string;
    Invalid: number;
    SkippedImports: number;
    /** The detached loop the trace adapter builds (undefined when no bus was
     *  present at construction - the graph then hears no observation trace). */
    Loop?: Queue | undefined;
    /** The latest detached re-index; the smoke awaits it (no sleep, no timer). */
    Flush: Promise<void>;
}
