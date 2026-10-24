import type { Dismissal, Knowledge, KnowledgeRow } from "../Interface/Execution.js";
/** The empty knowledge (the cold start). */
export declare const Empty: () => Knowledge;
export default _default;
/**
 * Load the knowledge file; a missing or corrupt file yields empty knowledge
 * (the corruption fallback of plan section 5.3). The optional fields the
 * PoC files predate (`dismissals`, the seed markers) are normalized here, so
 * an older file loads without a migration.
 * @param File - the knowledge file path.
 */
declare function _default(File: string): Knowledge;
/**
 * Look up one candidate's history row.
 * @param Knowledge - the loaded knowledge.
 */
export declare const Row: (Knowledge: Knowledge, Intent: string, Path: string) => KnowledgeRow | undefined;
/**
 * Record one emitted note: the candidates get their counts, the stats move,
 * a journal entry is appended (bounded).
 *
 * A SEEDED row is a PRIOR, not an observation: the emit leaves its count
 * alone (the seed's warm Laplace rate is stable across emits, so a note's
 * candidate set does not re-order against itself and the dedupe still sees
 * the same set). The first follow converts the row into an observed row
 * (Followed clears the marker) and the ordinary counting resumes.
 */
export declare const Emitted: (Knowledge: Knowledge, Intent: string, Call: string, Kappa: number, Paths: string[], At: number) => void;
/**
 * Record that the model followed a candidate (a candidate path appears in a
 * later call): count/followed move, the journal entry closes as "followed".
 * A seeded row becomes an observed row here (the marker is cleared).
 */
export declare const Followed: (Knowledge: Knowledge, Intent: string, Path: string, At: number) => void;
/**
 * Record that a note's window closed untouched: the near-miss/ignored
 * penalty of plan section 6.2 (the history drop is applied by Score via the
 * Laplace inputs; here only the stats and the journal move).
 */
export declare const Ignored: (Knowledge: Knowledge, Intent: string) => void;
/**
 * Record one dismissal (the `suggestion_dismiss` tool's write): replace the
 * entry for the same intent and path, or append it, then move the stats
 * counter and prune the expired rows. The caller saves the file.
 */
export declare const Dismiss: (Knowledge: Knowledge, Intent: string, Path: string | undefined, Until: number, At: number) => Dismissal;
/**
 * Whether a dismissal covers the intent (`Path` undefined asks for the
 * family) or the candidate path (a family dismissal covers every path).
 * Expired rows are pruned on the read, so the TTL needs no timer.
 */
export declare const Dismissed: (Knowledge: Knowledge, Intent: string, Path: string | undefined, At: number) => boolean;
/**
 * Save the knowledge file atomically (temp + rename, mode 0600); a failure
 * is silent here - the caller decides whether to log.
 * @param File - the knowledge file path.
 */
export declare const Save: (Knowledge: Knowledge, File: string) => void;
