export default _default;
/**
 * @module Expand
 *
 * The tilde expansion for config-supplied paths: a leading `~` maps to the user's home
 * directory and every other path passes through unchanged.
 *
 * @remarks
 *
 * `~` becomes the home itself and `~/x` becomes home + `x`. `os.homedir()` honors `$HOME`
 * on POSIX, so tests can redirect it to a temporary root. Every writer of a config-supplied
 * path (the factory's ledger, the module journals, the ccr store) calls this exactly once
 * at its write site - the desktop profile configures `logFile: ~/.dsh/<name>.log`, and an
 * unexpanded `~` makes the write fail ENOENT silently under the writer's catch.
 */
declare function _default(Path: string): string;
