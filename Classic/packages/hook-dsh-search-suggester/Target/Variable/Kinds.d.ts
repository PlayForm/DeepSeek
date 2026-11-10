/**
 * @module Kinds
 *
 * The graph node kinds each search family expects to find at its candidates (the P2
 * projection's kind test).
 *
 * @remarks
 *
 * The order is the preference: Measure picks the first expected kind present at a path, so a
 * suite file answers a Test intent with its `Test` node (not its `File` node) and a
 * definition answers a Symbol intent with its `Symbol` node.
 *
 * THE HISTORY FAMILY expects a plain file (the touched paths are the agent's own reads and
 * edits), so a node of any other kind scores the lower tier.
 *
 * The node kinds are the graph's frozen vocabulary (Interface/Node of
 * plugin-dsh-workspace-graph): File, Symbol, Block, Test, DocSection. A family absent here
 * expects nothing in particular, and every hit counts as an unexpected kind (the lower
 * literal tier).
 */
/**
 * The expected node kinds per search family, in preference order.
 */
declare const _default: Record<string, string[]>;
export default _default;
