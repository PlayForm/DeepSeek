export default (Rows) =>
	`${JSON.stringify(
		Rows.map((Row) => ({
			name: Row.Name,
			version: Row.Version,
			tier: Row.Tier,
			tree: Row.Tree,
			dir: Row.Directory,
			registry: {
				versions: Row.Versions,
				latest: Row.Latest,
			},
		})),
		null,
		"\t",
	)}\n`;
