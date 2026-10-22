export default interface Config {
    /** Master switch (default true - a registry is inert without callers). */
    enabled: boolean;
    /** The service's own ledger file, one log per module. */
    logFile: string;
    /** The JSON snapshot path (the local store under ~/.dsh). */
    storagePath: string;
    /** Matches below this abstain (the empty result, never a guess). */
    matchThreshold: number;
    /** Maximum matches returned by one Match call. */
    maxMatches: number;
    /** Two matches within this epsilon are "equally matched" -> abstain. */
    ambiguityEpsilon: number;
    /** Confidence half-life in days (the stale-pattern decay). */
    decayHalfLifeDays: number;
    /** Confidence deltas per outcome. */
    acceptBonus: number;
    rejectPenalty: number;
    appliedBonus: number;
    failedPenalty: number;
}
