import type State from "../Interface/State.js";
/**
 * @module Locate
 *
 * The node-targeted span resolution: the graph's frozen node id becomes the
 * span a reflective Replace rewrites, plus the kind/name the fingerprint
 * needs.
 *
 * @remarks
 *
 * THE GRAPH IS THE AST SOURCE: `workspaceGraph.getNode(id)` carries the node's
 * 1-based inclusive span and its content-derived fingerprint. The graph is
 * PROBED (`ctx.get`), never injected - an absent graph is the textual
 * fallback: the caller's explicit span is used when it supplied one, and the
 * kind/name still come from the id grammar (so the fingerprint is verified
 * either way). A node whose span the graph does not know, a node for another
 * path, and a node kind the reflective ops do not target are all REFUSALS with
 * their documented reason, never a guessed span.
 */
/**
 * The resolved target of a node-targeted operation.
 */
export interface Located {
    ok: true;
    /**
     * The 1-based inclusive span to rewrite.
     */
    span: {
        startLine: number;
        endLine: number;
    };
    /**
     * The fingerprint's kind component (Symbol / Block).
     */
    kind: string;
    /**
     * The fingerprint's name component (a Block hashes the empty name).
     */
    name: string;
}
/**
 * A refusal with its documented reason.
 */
export interface Refused {
    ok: false;
    reason: string;
}
export default _default;
declare function _default(State: State, Id: string, Path: string, Fallback?: {
    startLine: number;
    endLine: number;
}): Promise<Located | Refused>;
