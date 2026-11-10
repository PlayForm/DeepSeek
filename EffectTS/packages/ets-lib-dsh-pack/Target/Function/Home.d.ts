import type Options from "../Interface/Options.js";
export default _default;
/**
 * @module Home
 *
 * Reads the home directory the user layer hangs off.
 *
 * @remarks
 *
 * The explicit option (a smoke's temporary home) wins, then `HOME`, then
 * `os.homedir()`. The library never writes; it only reads
 * `<home>/.dsh/playform/workspaces/<slug>.yml`.
 */
declare function _default(Options?: Options): string;
