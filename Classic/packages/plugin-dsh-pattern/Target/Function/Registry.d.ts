import type Pattern from "../Interface/Pattern.js";
export default class Registry {
    private Patterns;
    /** Idempotent by id: replace in place, keep position irrelevant. */
    Put(Pattern_: Pattern): void;
    Get(Id: string): Pattern | undefined;
    /** All patterns, sorted by id (deterministic output). */
    List(): Pattern[];
    Size(): number;
    /** Replace the whole table (the snapshot load path). */
    Reset(Patterns: Pattern[]): void;
}
