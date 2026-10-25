// The workspace packages of one release tree.
//
// A package is any directory under <tree>/packages that carries its own
// package.json; the manifest is returned whole so each caller derives only the
// fields it needs (dependencies, description, the dsh.bundle marker, engines)
// instead of the shared reader guessing a union of every caller's shape.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import Root from "./Root.mjs";

export default (Tree) => {
	const Base = join(Root, Tree, "packages");
	return readdirSync(Base)
		.filter((Directory) => existsSync(join(Base, Directory, "package.json")))
		.map((Directory) => {
			const Path = join(Base, Directory);
			const Manifest = JSON.parse(readFileSync(join(Path, "package.json"), "utf8"));
			return {
				Tree,
				Directory,
				Path,
				Name: Manifest.name,
				Version: Manifest.version,
				Manifest,
			};
		});
};
