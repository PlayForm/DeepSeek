export default _default;
/**
 * @module Folders
 *
 * The immediate subdirectory names of one directory, sorted.
 *
 * @remarks
 *
 * The order is the order the reconciliation names the directories in. A
 * missing or unreadable directory is an EMPTY list, never a throw: the
 * reconciliation runs on the judged hot path and must stay fail-open (the
 * listener's own catch is the last resort).
 */
declare function _default(Directory: string): string[];
