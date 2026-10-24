// Home - the home directory the user layer hangs off: the explicit option
// (a smoke's temporary home), then HOME, then os.homedir(). The library
// never writes; it only reads `<home>/.dsh/playform/workspaces/<slug>.yml`.
import { homedir } from "node:os";

import type Options from "../Interface/Options.js";

export default (Options?: Options): string => Options?.home ?? (process.env["HOME"] || homedir());
