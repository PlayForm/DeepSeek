export default _default;
/**
 * @module Expand
 *
 * The tilde expansion for config-supplied paths: a leading "~" maps to the
 * user's home directory.
 *
 * @remarks
 *
 * "~" becomes the home itself and "~/x" becomes home + "x"; every other path
 * (absolute, relative, empty) passes through unchanged. `os.homedir()` honors
 * $HOME on POSIX, so tests can redirect it to a temporary root. Every writer
 * of a config-supplied path (the factory's ledger, the module journals, the
 * ccr store) calls this exactly once at its write site - the desktop profile
 * configures `logFile: ~/.dsh/<name>.log`, and an unexpanded "~" makes the
 * write fail ENOENT silently under the writer's catch.
 *
 * Mirrored from the Classic core (`@playform/lib-dsh-core`'s
 * `Function/Expand`): the ETS twins import it from this base under the
 * lib-dsh-core -> ets-base-dsh substitution, so the pure helper lives here
 * with the same byte-identical behaviour.
 */
declare function _default(Path: string): string;
