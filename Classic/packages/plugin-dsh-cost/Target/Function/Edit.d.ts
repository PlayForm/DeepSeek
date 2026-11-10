/**
 * @module Edit
 *
 * The edit grain parser: one tool call's name and arguments string become the
 * hunks the call produces.
 *
 * @remarks
 * The parser follows `Documentation/Plans/COST-TRACK-PLUGIN.md` section 17.3.
 * It yields one row per edit entry of an "edit" or "multi_edit" call (a single
 * entry object or an "edits" array), one row from the written content of a
 * "write" call, one row from the added and removed lines of an "apply_patch"
 * call's patch body, and one row summing the operations a "batch_edit" or
 * "batch_edit_commit" call carries - with the line counts read as newline
 * counts (counted with a split, never a regex) and the byte counts as the
 * UTF-8 encoded lengths (Buffer.byteLength), never the UTF-16 code units of the
 * string. The ordinal is the entry's array index, or 0 for a call-wide row.
 *
 * A tool the grain does not map, a malformed or alien arguments string, an
 * unknown shape, and a patch or operation table the parser cannot read yield no
 * rows; the parser never throws. A write records its whole content as added and
 * marks the row's Basis "removal-unknown", because the arguments never carry
 * the before content, so the removed side is unknown rather than zero; a patch
 * that deletes a file and a batch operation that replaces or removes a match
 * carry the same marker for the same reason.
 */
import type Hunk from "../Interface/Edit.js";
export default _default;
declare function _default(Tool: string, Arguments: string, At: number): readonly Hunk[];
