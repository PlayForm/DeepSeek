/**
 * @module References
 *
 * The `references` edge's consumer wiring (the plan's missing half): after a file is parsed,
 * the graph asks the workspace-semantics service for the file's reference list and turns each
 * reference into one honest edge.
 *
 * @remarks
 * THE SERVICE IS PROBED, NEVER INJECTED (`ctx.get`), exactly like the trace bus: the loader
 * contract's `inject` stays ["fs", "storage"], so a bare fixture or a direct construction is
 * unchanged. The registered name is `workspaceSemantics`; the plan's short alias `semantics`
 * is accepted too, so a deployment that registers the service under either name is served.
 *
 * THE HONESTY RULES (never a faked edge):
 * - no service, or a service whose resolve answers `undefined` (disabled, an excluded path,
 *   no adapter) -> NO references edges at all;
 * - a reference whose target head matches no Symbol node of THIS file is dropped - the target
 *   is unresolved, and an edge to a node that does not exist would be a lie;
 * - the edge points FROM the node that uses the symbol (the first Symbol node whose span
 *   contains the use site, else the File node) TO the used Symbol node, carrying the use
 *   site's line span.
 *
 * The service reads the file through its own fs seam (the model is the service's), so this
 * module never reads a file: it is handed the text the graph already read, and only converts
 * the service's character offsets to the graph's 1-based line spans.
 */
import type Edge from "../Interface/Edge.js";
import type Node from "../Interface/Node.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(StateRef: State, Path: string, Text: string, Nodes: Node[]): Promise<Edge[]>;
