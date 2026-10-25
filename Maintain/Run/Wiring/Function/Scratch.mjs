import FileSystem from "node:fs";
import Os from "node:os";
import Path from "node:path";

import Persistent from "../Variable/Persistent.mjs";

export default (Tree) =>
	Persistent
		? Path.join(Persistent, Tree === "EffectTS" ? "ets" : "classic")
		: FileSystem.mkdtempSync(Path.join(Os.tmpdir(), `dsh-wiring-${Tree}-`));
