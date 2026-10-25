import Classify from "./Classify.mjs";

export default (Package, Document) => ({
	...Package,
	Tier: Classify(Package, Document),
	Versions: Document === null ? [] : Object.keys(Document.versions ?? {}),
	Latest: Document === null ? null : (Document["dist-tags"]?.latest ?? null),
});
