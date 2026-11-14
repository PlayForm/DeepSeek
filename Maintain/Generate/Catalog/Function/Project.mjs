// Project one parsed catalog section onto the shape the coach's static fallback
// reads: the tool description plus the parameters' own descriptions.
//
// The projection keeps the parameter schema STRUCTURALLY JSON-Schema so the
// runtime runs one code path for the live registry and the static table: the
// coach extracts a default from `description` ("Defaults to X." - the harness's
// house convention) and honours a `default` annotation when a tool declares
// one. Deciding what a default MEANS is the runtime's job, not this file's.
const Properties = (Schema) => {
	const Source = Schema?.properties ?? {};
	const Out = {};
	for (const [Name, Node] of Object.entries(Source)) {
		const Property = {};
		if (typeof Node?.description === "string") {
			Property.description = Node.description;
		}
		if (Node?.default !== undefined) {
			Property.default = String(Node.default);
		}
		Out[Name] = Property;
	}
	return Out;
};

export default (Tools) => {
	// First occurrence wins: the catalog documents each tool package separately,
	// so a name can appear twice (the plain `bash` and its persistent twin). The
	// plain tool is the one a note names by default; the live fetch always wins
	// over this table when the registry is reachable.
	const ByName = new Map();
	for (const Tool of Tools) {
		if (ByName.has(Tool.name)) {
			continue;
		}
		const Required = Tool.schema?.required;
		ByName.set(Tool.name, {
			name: Tool.name,
			description: Tool.description,
			parameters: {
				type: "object",
				properties: Properties(Tool.schema),
				...(Array.isArray(Required) && Required.length > 0
					? { required: [...Required] }
					: {}),
			},
		});
	}
	return [...ByName.values()].sort((Left, Right) =>
		Left.name < Right.name ? -1 : Left.name > Right.name ? 1 : 0,
	);
};
