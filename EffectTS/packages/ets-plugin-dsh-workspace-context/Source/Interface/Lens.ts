// Lens - one lens specification: the node kinds and edge kinds that
// participate when the packet is built through the lens. The catalog is
// Variable/DefaultLens.ts; config `lenses` selects which are available.
export default interface Lens {
	/** The lens name (the tool's `lens` argument). */
	name: string;
	/** The node kinds eligible as focus and as neighbors. */
	nodes: string[];
	/** The edge kinds that count as neighbors. */
	edges: string[];
}
