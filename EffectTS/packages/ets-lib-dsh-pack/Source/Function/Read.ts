// Read - read one pack file and parse it: `.json` through JSON.parse, every
// other extension through the strict YAML-subset parser. The root must be a
// mapping; a malformed file throws (the suggester's fail-open listener turns
// that into a warning and silence).
import { readFileSync } from "node:fs";
import { extname } from "node:path";

import type Pack from "../Interface/Pack.js";
import Parse from "./Parse.js";

export default (Path: string): Pack => {
	const Text = readFileSync(Path, "utf8");
	const Value: unknown = extname(Path) === ".json" ? JSON.parse(Text) : Parse(Text);
	if (Value === null || typeof Value !== "object" || Array.isArray(Value)) {
		throw new Error(`pack ${Path}: the root must be a mapping`);
	}
	return Value as Pack;
};
