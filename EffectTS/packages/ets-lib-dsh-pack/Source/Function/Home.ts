import { homedir } from "node:os";

import type Options from "../Interface/Options.js";

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
export default (Options?: Options): string => Options?.home ?? (process.env["HOME"] || homedir());
