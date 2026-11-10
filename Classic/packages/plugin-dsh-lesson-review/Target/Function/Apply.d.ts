import type Configuration from "../Interface/Config.js";
import type { Op } from "../Interface/Proposal.js";
/**
 * @module Apply
 *
 * The guarded corpus write: the ONLY module that touches the skill tree, and the place where the judge's acceptance becomes a file.
 *
 * @remarks
 *
 * THE FENCE IS THE EXISTENCE CHECK, not a version number. Every operation
 * declares which side of the existence line it lives on, and the write
 * refuses the other side:
 *
 * - `create` -> the SKILL.md must NOT exist (a create never overwrites)
 * - `patch` -> the SKILL.md must exist (a patch never invents a skill)
 * - `support` -> the skill directory must exist (a file never creates a skill)
 * - `archive` -> the directory must exist and the archive target must NOT
 *
 * A refusal is returned, never thrown: the caller records it as a rejection
 * and keeps the rest of the run. A throw here would discard every operation
 * the judge already accepted.
 *
 * AGREEMENT OPERATIONS NEVER REACH THIS MODULE. `~/.dsh/AGENTS.md` is the
 * user's file; the service queues those proposals and says so in the ledger.
 */
/**
 * Expand a leading `~` (the family's path convention for every knob).
 */
export declare const Expand: (Path_: string) => string;
/**
 * The apply result: where it landed, or why it did not.
 */
export type ApplyResult = {
    ok: true;
    path: string;
} | {
    ok: false;
    error: string;
};
export default _default;
declare function _default(Op: Op, Knobs: Configuration): Promise<ApplyResult>;
