import * as FS from "node:fs";
import * as Path from "node:path";

/** Every file under a directory, recursively, relative to it. */
const Walk = (Root, Prefix = "") =>
	FS.readdirSync(Path.join(Root, Prefix), { withFileTypes: true }).flatMap((Dirent) => {
		const Relative = Path.join(Prefix, Dirent.name);
		return Dirent.isDirectory() ? Walk(Root, Relative) : [Relative];
	});

export default Walk;
