/**
 * The per-folder counter: `N` = passing checks, `F` = failing checks. Passed
 * by reference so Check can bump it from inside its callback.
 */
export type Counter = {
    N: number;
    F: number;
};
/**
 * A fresh counter for one test folder.
 */
export declare const MakeCounter: () => Counter;
/**
 * One check = the source suite's Check (one PASS/FAIL line each). The
 * callback carries that check's condition VERBATIM (same bytes, same order
 * within the folder); a throw inside counts the check failed - every later
 * check still runs, and Finish turns any failure into a non-zero exit for
 * the runner.
 */
export declare const Check: (Count: Counter, Label: string, Assertions: () => void) => void;
/**
 * The async variant of Check, for checks that await the post-execute
 * listener or the ccr_retrieve tool. Same counting and printing; the caller
 * must await it so checks stay sequential and Finish sees the final counts.
 */
export declare const CheckAsync: (Count: Counter, Label: string, Assertions: () => Promise<void>) => Promise<void>;
/**
 * End-of-folder guard: any failed assertion is a folder failure. Returns the
 * PASS count for the runner's `N PASS - <Name>` line (the vacuously-green
 * backstop: the runner compares it against the folder README's expected
 * count).
 */
export declare const Finish: (Count: Counter, Name: string) => number;
export declare const Ledger = "/tmp/ccr-smoke-ledger.log";
export declare const JournalPath = "/tmp/ccr-smoke-journal.jsonl";
export declare const Rm: () => void;
export declare const Furnace: any;
/**
 * The real-config shape the loader hands to apply: volatile fields arrive as
 * `{ get }` cells. Build one via the schema. The cast is fixture-only
 * scaffolding - every check reads the returned object through the same
 * expressions the source suite uses.
 */
export declare const Validate: (Raw: Record<string, unknown>) => any;
/**
 * The fake ctx + one apply: on() captures listeners AND their options (the
 * posture check), get() serves the REAL factory for "pluginFactory" and
 * throws for anything else (the factory's probe-once Seam catches the
 * throw), logger captures info + warn lines, the tool registry seam captures
 * the ccr_retrieve registration, and the fake ctx is its own root. The
 * typing is `any` deliberately - fixture-only scaffolding, so every check in
 * the folders reads the captures through the source suite's exact
 * expressions.
 */
export declare const Make: (Raw: any) => any;
/**
 * The expected hash of a content array - the same sha256-24 of the
 * serialized bytes the bundle's Function/Hash computes (node:crypto, first
 * 24 hex).
 */
export declare const HashOf: (Content: any) => string;
/**
 * The exact serialized size of a content array.
 */
export declare const SizeOf: (Content: any) => number;
/**
 * The single text block shape.
 */
export declare const TextBlock: (Text: string) => any[];
/**
 * The exec stub passed to the post-execute listener and to ccr_retrieve.
 */
export declare const Exec: (Name: string) => any;
/**
 * The waterfall's downstream decision (the registry default: an accept with
 * no content and no value).
 */
export declare const NextAccept: () => Promise<any>;
/**
 * A terminal-shaped text: the harness's `exit code: 0` echo + filler rows.
 */
export declare const TerminalText: (Fill: string, Rows: number) => string;
/**
 * A ~N byte single-line text (the fill length scales the total).
 */
export declare const PlainText: (Bytes: number) => string;
