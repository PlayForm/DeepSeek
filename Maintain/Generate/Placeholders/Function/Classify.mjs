export default (Package, Document) => {
	switch (true) {
		case Document === null:
			return "1-missing";
		case Boolean(Document.versions?.[Package.Version]):
			return "3-published";
		default:
			return "2-placeholder";
	}
};
