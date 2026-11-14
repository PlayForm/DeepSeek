/**
 * @module Store
 *
 * The suggester learning store: the per-mount learning machine the suggester
 * hooks share.
 *
 * @remarks
 *
 * The store is the learning machine behind the suggester family: the outcome
 * of a note's follow-through (an accepted or a rejected verdict) moves a
 * candidate's confidence toward or away from the floor, the shared pattern
 * service is probed once per read/write and a bounded map is the fallback when
 * the probe answers undefined, and the decision records ride the same two
 * backends.
 *
 * The arithmetic (the pattern service's documented defaults): every rate
 * starts at the neutral Laplace prior 1/3, an accepted outcome adds 0.1, a
 * rejected one subtracts 0.2, and the result is clamped into 0..1. In the
 * memory fallback the store applies that arithmetic itself, keyed by the same
 * deterministic ids (`<module>:family:<Family>`,
 * `<module>:companion:<Path>`,
 * `<module>:decision:<Family>:<sorted paths joined by |>`) and evicting the
 * oldest entry when the caller's bound is reached. In the service path the
 * store only seeds a rate record at the neutral rate when it is absent, so the
 * first outcome moves it exactly like the memory fallback, and hands the
 * outcome to the service's own `Record`; the decision record is projected onto
 * the pattern schema's read-only string fields rather than extending it.
 *
 * The probe and the state are the caller's: the factory takes the caller's
 * probe (the per-use read of the shared pattern service, answering the whole
 * Get/Put/Record contract or undefined - a partial or foreign service is the
 * caller's to treat as absent), the module id (the key prefix and the rate
 * records' arbiter), the memory bound, the caller's heuristic-table composer
 * (the decision projection's `weights` lines) and the caller's stamp, and
 * returns the six methods (`Store`, `Rate`, `Move`, `Remember`, `Resolve`,
 * `Recent`). The store is per mount: every factory call builds fresh maps, so
 * the machine is born in the caller's `apply` and dies with the mount.
 *
 * Pure: no I/O, no clock, no timers - the records are stamped through the
 * caller's stamp.
 */
/**
 * The six pickable heuristic values a companion row and a decision's weight
 * table carry (the caller's table composer reads them).
 */
interface Heuristics {
    /**
     * The call matched the family's path rules.
     */
    scope: number;
    /**
     * The graph-distance placeholder.
     */
    graph: number;
    /**
     * The pack's prior for the companion.
     */
    prior: number;
    /**
     * The literal proof of the companion.
     */
    literal: number;
    /**
     * The learned per-companion accept rate.
     */
    history: number;
    /**
     * The learned per-family accept rate.
     */
    accept: number;
}
/**
 * One companion row of a decision, read structurally (the caller's own row,
 * carried through untouched).
 */
interface Companion {
    /**
     * The companion path or glob.
     */
    path: string;
    /**
     * The weighted score the row was ranked by (the caller's rank).
     */
    score: number;
    /**
     * The six pickable heuristic values this row contributed.
     */
    heuristics: Heuristics;
}
/**
 * The caller's decision record, read structurally: the store carries it,
 * resolves its outcome and projects it onto the pattern schema - it never
 * extends it.
 */
interface Decision {
    /**
     * The pack family that won the detection.
     */
    family: string;
    /**
     * The family's confidence kappa.
     */
    kappa: number;
    /**
     * The ranked companion rows.
     */
    companions: Companion[];
    /**
     * The effective weight table the score used.
     */
    weights: Heuristics;
    /**
     * The enabled heuristic names, canonical order.
     */
    enabled: string[];
    /**
     * The outcome placeholder, then the follow-through's verdict.
     */
    outcome: "pending" | "accepted" | "rejected";
    /**
     * The store that answered the record's write.
     */
    store: "pattern" | "memory";
}
/**
 * One pattern record (the pattern service's serializable projection).
 */
interface Stored {
    /**
     * The registry id.
     */
    id: string;
    /**
     * The intent label (the family id).
     */
    intent: string;
    /**
     * The trigger signals (the family id or the companion path, lowercased).
     */
    trigger: {
        tool?: string | undefined;
        keywords: string[];
    };
    /**
     * The target subgraph as paths (the companion set).
     */
    targets: string[];
    /**
     * The descriptions-only lines (the decision record's projection).
     */
    transform: string[];
    /**
     * The arbiter (the outcome for a decision record, the module for a rate).
     */
    arbiter: string;
    /**
     * The confidence in 0..1 (the learned rate, or the decision's kappa).
     */
    confidence: number;
    /**
     * The decision hook's eligibility hint (always false here).
     */
    allowlist: boolean;
    /**
     * Last write time (the caller's stamp).
     */
    updatedAt: number;
}
/**
 * The structural view of the pattern service the caller's probe answers: the
 * whole Get/Put/Record contract, or undefined.
 */
interface Registry {
    /**
     * One record by id.
     */
    Get?: (Id: string) => Stored | undefined;
    /**
     * Idempotent upsert by id.
     */
    Put?: (Pattern: Stored) => void;
    /**
     * The outcome move on one record.
     */
    Record?: (Id: string, Outcome: "accepted" | "rejected") => void;
}
export default _default;
declare function _default(
/**
 * The caller's probe: the per-use read of the shared pattern service,
 * answering the whole Get/Put/Record contract or undefined.
 */
Probe: () => Registry | undefined, 
/**
 * The module id (the key prefix and the rate records' arbiter).
 */
Module: string, 
/**
 * The memory fallback's bound (the caller's `storeLimit`).
 */
Limit: number, 
/**
 * The caller's heuristic-table composer (the decision projection's
 * `weights` lines).
 */
Table: (Values: Heuristics) => string, 
/**
 * The caller's stamp (the records' `updatedAt`; the core keeps no clock).
 */
Stamp: () => number): {
    Store: () => "pattern" | "memory";
    Rate: (Family: string, Path: string) => {
        Companion: number;
        Family: number;
    };
    Move: (Family: string, Paths: string[], Outcome: "accepted" | "rejected") => void;
    Remember: (Family: string, Paths: string[], Record: Decision) => void;
    Resolve: (Family: string, Paths: string[], Outcome: "accepted" | "rejected") => void;
    Recent: () => Decision[];
};
