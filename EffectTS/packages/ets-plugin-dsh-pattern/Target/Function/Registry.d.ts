import type Pattern from "../Interface/Pattern.js";
/**
 * @module Registry
 *
 * The in-memory store: id -> pattern, with idempotent Put, Get, and List.
 *
 * @remarks
 *
 * Function/Registry. A re-Put of the same id replaces in place and keeps no
 * duplicate (the HMR-idempotence rule). List is sorted by id for a
 * deterministic output. The Map lives on the service instance; the snapshot
 * persistence is Function/Snapshot's business.
 */
export default class Registry {
    private Patterns;
    /**
     * Idempotent by id: replace in place, keep position irrelevant.
     */
    Put(Pattern_: Pattern): void;
    Get(Id: string): Pattern | undefined;
    /**
     * All patterns, sorted by id (deterministic output).
     */
    List(): Pattern[];
    Size(): number;
    /**
     * Replace the whole table (the snapshot load path).
     */
    Reset(Patterns: Pattern[]): void;
}
