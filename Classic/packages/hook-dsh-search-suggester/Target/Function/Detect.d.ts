/**
 * @module Detect
 *
 * The deterministic classifier: a pure function over (call, ring, userText, pack) that
 * returns the ranked detections.
 *
 * @remarks
 * The module is the plan's section 4.3. No LLM in the hot path; the rules are the pack's
 * regex sources compiled here per call (the hot path's compiled-once optimization is the
 * end-phase's measured concern; the PoC keeps one pure function); the cost is O(10 intents x
 * ~3 rules) plus a map lookup - no I/O, no allocation beyond the detections.
 *
 * The matching rules (plan section 3.8, ordered R1-R13):
 *
 *   - each intent's call signals are matched against the call text (the grep/glob pattern,
 *     the read file_path, or the first search-shaped bash segment) and its path - a matched
 *     signal adds its weight;
 *   - R12 context: the user text contains the intent's context word - +0.3;
 *   - R13 loop: the same intent detected in 2 of the last 4 calls with no edit between -
 *     +0.2 (the model is searching in circles);
 *   - an intent with zero evidence and no loop is not a candidate.
 *
 * The winner (highest priority among matches) and the runner-up (folded into one note only
 * when its kappa is within 0.1) are chosen by Score, which owns the kappa math; Detect only
 * ranks.
 */
import type { CallView, Detection, Intent } from "../Interface/Execution.js";
export default _default;
declare function _default(
/** The pack: the intents in priority order. */
Pack: Intent[], 
/** The current judged call. */
Call: CallView, 
/** The ring: the last calls' intent ids, oldest first (the most recent 4 are read). */
Intents: string[], 
/** The user text (the latest user message), lowercased. */
UserText: string): Detection[];
