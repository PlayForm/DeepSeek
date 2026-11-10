export default _default;
/**
 * @module Segments
 *
 * The command splitter: one terminal command may be a compound ("cd x && git status"), so the
 * guard classifies EVERY segment.
 *
 * @remarks
 *
 * The command is split on the shell separators (`&&`, `||`, `;`, `|`, newline); each segment is
 * trimmed; empty segments are dropped.
 *
 * Pure internal calculation - no subprocess, no I/O.
 */
declare function _default(Command: string): string[];
