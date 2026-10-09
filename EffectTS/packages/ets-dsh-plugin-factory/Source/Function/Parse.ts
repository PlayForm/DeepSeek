// Parse — read a JSON file, null on any failure. Error-contained — every
// unreadable/non-JSON file maps to null instead of a throw. Byte-identical
// with the trio's Function/Parse.
//
// Exemption (documented): used ONLY for auxiliary discovery files
// (registry.json, the policy sidecars) — plain synchronous reads so the
// listener's g2 stage stays await-free. The GOVERNED manifest is never read
// here: that read goes through `ctx.fs.readText` (Function/Continue).
import * as FileSystem from "node:fs";

export default (Path: string): unknown => {
	try {
		return JSON.parse(FileSystem.readFileSync(Path, "utf8"));
	} catch {
		return null;
	}
};
