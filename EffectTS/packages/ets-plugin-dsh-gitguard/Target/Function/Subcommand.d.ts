export default _default;
/**
 * @module Subcommand
 *
 * The git subcommand extractor: given one command segment, return the git subcommand it invokes,
 * or undefined when the segment is not a git command.
 *
 * @remarks
 *
 * - `"git status"` -> `"status"`;
 * - `"git  log --oneline"` -> `"log"`;
 * - `"git"` -> `""` (bare git - e.g. `git --version` parses as bare, since a leading flag is not
 *   a subcommand);
 * - `"git status && git add -A"` -> `"status"` (one segment at a time; the caller splits
 *   compounds first);
 * - `"ls -la"` -> undefined (not a git command).
 *
 * Leading flags (`git --no-pager log`) are skipped: the first non-flag token is the subcommand. A
 * leading env prefix (`GIT_EDITOR=... git ...`) is handled by skipping `KEY=VALUE` tokens. Pure
 * internal calculation.
 */
declare function _default(Segment: string): string | undefined;
