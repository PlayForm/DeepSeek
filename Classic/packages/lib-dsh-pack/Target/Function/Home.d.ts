import type Options from "../Interface/Options.js";
export default _default;
/**
 * @module Home
 *
 * The home directory the user layer hangs off: the explicit option (a smoke's
 * temporary home), then `HOME`, then `os.homedir()`.
 *
 * @remarks
 * The library never writes; it only reads
 * `<home>/.dsh/playform/workspaces/<slug>.yml`.
 */
declare function _default(Options?: Options): string;
