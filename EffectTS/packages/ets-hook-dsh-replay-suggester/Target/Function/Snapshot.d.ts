import type Entry from "../Interface/Entry.js";
import type Store from "../Interface/Store.js";
/** Read the fallback snapshot; null on any failure or version mismatch. */
export declare const Load: (Path: string) => Store | null;
/** Write the fallback snapshot; never throws. */
export declare const Save: (Path: string, Entries: Entry[], Now: number) => Promise<void>;
