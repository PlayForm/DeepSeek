export default interface Lens {
    /** The lens name (the tool's `lens` argument). */
    name: string;
    /** The node kinds eligible as focus and as neighbors. */
    nodes: string[];
    /** The edge kinds that count as neighbors. */
    edges: string[];
}
