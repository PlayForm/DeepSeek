export default (Path) =>
	Path.endsWith(".md") ||
	Path.startsWith("Site/") ||
	Path.startsWith("Test/") ||
	Path.split("/").some(
		(Segment) =>
			Segment === "node_modules" ||
			Segment === "Target" ||
			Segment === "target" ||
			Segment === "dist" ||
			Segment === ".turbo" ||
			Segment === ".cache",
	);
