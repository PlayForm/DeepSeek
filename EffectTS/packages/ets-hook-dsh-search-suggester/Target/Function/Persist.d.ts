import type { Knowledge, KnowledgeRow } from "../Interface/Execution.js";
/** The empty knowledge (the cold start). */
export declare const Empty: () => Knowledge;
export default _default;
/**
 * Load the knowledge file; a missing or corrupt file yields empty knowledge
 * (the corruption fallback of plan section 5.3).
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
 */
export declare const Emitted: (Knowledge: Knowledge, Intent: string, Call: string, Kappa: number, Paths: string[], At: number) => void;
/**
 * Record that the model followed a candidate (a candidate path appears in a
 * later call): count/followed move, the journal entry closes as "followed".
 */
export declare const Followed: (Knowledge: Knowledge, Intent: string, Path: string, At: number) => void;
/**
 * Record that a note's window closed untouched: the near-miss/ignored
 * penalty of plan section 6.2 (the history drop is applied by Score via the
 * Laplace inputs; here only the stats and the journal move).
 */
export declare const Ignored: (Knowledge: Knowledge, Intent: string) => void;
/**
 * Save the knowledge file atomically (temp + rename, mode 0600); a failure
 * is silent here - the caller decides whether to log.
 * @param File - the knowledge file path.
 */
export declare const Save: (Knowledge: Knowledge, File: string) => void;
