import FileSystem from "node:fs";
import Path from "node:path";

import Root from "../../../Common/Function/Root.mjs";
import Trees from "../../../Common/Variable/Trees.mjs";
import Clusters from "../Variable/Clusters.mjs";
import FileFlavor from "../Variable/FileFlavor.mjs";
import Digest from "./Digest.mjs";
import Guarded from "./Guarded.mjs";
import Normalize from "./Normalize.mjs";

// The package name per tree/flavor. The two release groups share the flavor
// suffix but never the prefix.
const PackageName = (Tree, Flavor) =>
	`${Tree === "Classic" ? "" : "ets-"}${Flavor === FileFlavor ? "plugin" : "hook"}-dsh-normalize-${Flavor}`;

// The relative file path the baseline records (POSIX separators, so a
// Windows checkout hashes the same key).
const FilePath = (Tree, Flavor, Cluster) =>
	`${Tree}/packages/${PackageName(Tree, Flavor)}/Source/Function/${Cluster}.ts`;

// Read every guarded file and compute its normalized hash. A missing file is
// recorded with `null` so the check reports it as a failure instead of
// crashing.
export default () => {
	const Entries = [];
	for (const Tree of Trees) {
		for (const Cluster of Clusters) {
			const Files = {};
			for (const Flavor of Guarded(Cluster)) {
				const Relative = FilePath(Tree, Flavor, Cluster);
				const Absolute = Path.join(Root, Relative);
				Files[Flavor] = {
					file: Relative,
					hash: FileSystem.existsSync(Absolute)
						? Digest(Normalize(FileSystem.readFileSync(Absolute, "utf8")))
						: null,
				};
			}
			Entries.push({ tree: Tree, cluster: Cluster, files: Files });
		}
	}
	return Entries;
};
