/**
 * @module Blocks
 *
 * The review prompt's byte-stable text, one block per rule family.
 *
 * @remarks
 *
 * THE PROVENANCE OF EVERY SENTENCE: these blocks are the Hermes background
 * review's prompts (`agent/background_review.py`: `_LESSON_LAYER_BLOCK`,
 * `_SKILL_REVIEW_PROMPT`, `_DO_NOT_CAPTURE_BLOCK`, `_COMBINED_REVIEW_PROMPT`,
 * `_MEMORY_ROUTING_BLOCK`) translated onto THIS harness's corpus vocabulary.
 * The translation is not cosmetic - three Hermes rules have a different owner
 * here and say so:
 *
 * - "the skill is a package" - here the package is specified by
 *   `~/.dsh/skills/STANDARD.md` (the four questions, the body section
 *   order, the single-owner corpus map), so the block names the standard
 *   instead of restating it;
 * - "memory has two stores" - here the two stores are the SKILL CORPUS and
 *   the WORKING AGREEMENT (`~/.dsh/AGENTS.md`), and the routing rule is the
 *   same one: a fact goes to ONE store, never both;
 * - "the curator consolidates" - here the deterministic transitions are this
 *   service's `Curate`, so the reviewer is told to NOTE overlap and never to
 *   archive for tidiness.
 *
 * WHY THE TEXT IS CONSTANT AND NOT GENERATED: the prompt is the contract the
 * judge enforces. A generated prompt drifts from the judge silently; a
 * constant one can be diffed, and the smokes assert its exact bytes.
 */
/**
 * The task framing and the "be active" instruction.
 */
export declare const Header: string;
/**
 * What a skill is, before any rule about changing one.
 */
export declare const Shape: string;
/**
 * What counts as a reason to act.
 */
export declare const Signals: string;
/**
 * Which operation to prefer (the judge's duplicate rules assume it).
 */
export declare const Order: string;
/**
 * What the write must carry (the judge refuses otherwise).
 */
export declare const Fence: string;
/**
 * Which of the two stores a lesson belongs in.
 */
export declare const Routing: string;
/**
 * What must not be captured.
 */
export declare const Never: string;
/**
 * The exact JSON contract, LAST, so it is the most recent instruction the model reads.
 */
export declare const Reply: string;
