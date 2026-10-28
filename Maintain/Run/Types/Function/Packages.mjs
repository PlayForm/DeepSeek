import FileSystem from "node:fs";
import Path from "node:path";

const TreeDirectories = { classic: "Classic", "effect-ts": "EffectTS" };

// The packages: every directory under each tree's packages/ that carries the
// package TypeScript configuration (the one `Build` compiles from).
export default (Scopes) => {
	const Packages = [];
	for (const Tree of Scopes) {
		const Root = Path.join(TreeDirectories[Tree], "packages");
		for (const Entry of FileSystem.readdirSync(Root, { withFileTypes: true })) {
			if (!Entry.isDirectory()) {
				continue;
			}
			const Package = Path.join(Root, Entry.name);
			if (FileSystem.existsSync(Path.join(Package, "tsconfig.json"))) {
				Packages.push({ Tree, Package });
			}
		}
	}
	return Packages;
};
