import Describe from "./Describe.mjs";
import Icon from "./Icon.mjs";
import Keywords from "./Keywords.mjs";
import Kind from "./Kind.mjs";
import Pin from "./Pin.mjs";
import Title from "./Title.mjs";

const RepositoryUrl = "https://github.com/PlayForm/DeepSeek";
const Placeholders = new Set(["0.0.0", "0.0.0-stage"]);

export default (Package, Document) => {
	const Description = Package.Manifest.description ?? "";
	const IconPath = Icon(Package.Directory);
	const Engine = Package.Manifest.engines?.dsh;
	const Engines = Engine === undefined ? {} : { dsh: Engine };
	const Versions = [];

	if (Document !== null) {
		for (const Version of Object.keys(Document.versions)) {
			if (Placeholders.has(Version)) {
				continue;
			}
			Versions.push({
				version: Version,
				publishTimestamp: Math.floor(Date.parse(Document.time[Version]) / 1000),
				source: { type: "npm" },
				engines: Engines,
			});
		}
	}

	const Published = new Set(Versions.map((Entry) => Entry.version));
	if (!Published.has(Package.Version)) {
		const Pinned = Pin(`${Package.Tree}/packages/${Package.Directory}`);
		Versions.push({
			version: Package.Version,
			publishTimestamp: Pinned.Time,
			source: {
				type: "git",
				url: RepositoryUrl,
				commit: Pinned.Commit,
				path: `${Package.Tree}/packages/${Package.Directory}`,
			},
			engines: Engines,
		});
	}

	const Labels = [Package.Tree.toLowerCase()];
	if (Versions.some((Entry) => Entry.source.type === "npm")) {
		Labels.push("npm");
	}
	if (Versions.some((Entry) => Entry.source.type === "git")) {
		Labels.push("source");
	}

	return {
		name: Package.Name,
		title: { en: Title(Package.Tree, Package.Directory) },
		...(Description.trim() === "" ? {} : { description: { en: Describe(Description) } }),
		...(IconPath === null ? {} : { icon: IconPath }),
		author: "PlayForm",
		repository: {
			url: RepositoryUrl,
			directory: `${Package.Tree}/packages/${Package.Directory}`,
		},
		metadata: {
			category: Kind(Package.Directory),
			keywords: Keywords(Package.Tree, Package.Directory),
			labels: Labels,
			sortKeys: {},
		},
		versions: Versions,
	};
};
