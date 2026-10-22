// LensFn - the lens resolution and filtering (Function/LensFn): resolve the
// requested lens name against config `lenses` and the shipped catalog, and
// return the node/edge kind filters. An unknown name falls back to the
// configured default; a default that is itself unknown degrades to no
// filtering (the honest "all" reading), reported to the caller through an
// OPEN line the packet builder adds.
import type Lens from "@Interface/Lens.js";

interface Resolved {
	name: string;
	nodes: Set<string>;
	edges: Set<string>;
	known: boolean;
}

export default (
	Requested: string | undefined,
	Available: string[],
	Default: string,
	Catalog: Lens[],
): Resolved => {
	const Name = Requested !== undefined && Available.includes(Requested) ? Requested : Default;
	const Spec = Catalog.find((Entry) => Entry.name === Name);
	switch (true) {
		case Spec === undefined:
			return {
				name: Name,
				nodes: new Set(),
				edges: new Set(),
				known: false,
			};
		default:
			return {
				name: Name,
				nodes: new Set(Spec.nodes),
				edges: new Set(Spec.edges),
				known: true,
			};
	}
};
