import { homedir } from "node:os";

import type Options from "../Interface/Options.js";

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

export default (Options?: Options): string => Options?.home ?? (process.env["HOME"] || homedir());
