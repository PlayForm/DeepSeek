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
