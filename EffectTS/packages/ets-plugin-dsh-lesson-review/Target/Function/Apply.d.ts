import type Configuration from "../Interface/Config.js";
import type { Op } from "../Interface/Proposal.js";
/** Expand a leading `~` (the family's path convention for every knob). */
export declare const Expand: (Path_: string) => string;
/** The apply result: where it landed, or why it did not. */
export type ApplyResult = {
    ok: true;
    path: string;
} | {
    ok: false;
    error: string;
};
export default _default;
declare function _default(Op: Op, Knobs: Configuration): Promise<ApplyResult>;
