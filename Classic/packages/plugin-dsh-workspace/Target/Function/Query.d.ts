import type { Node, WorkspaceGraph } from "@Interface/Graph.js";
import type { ContextResult, ExpandResult, FindResult, MapResult } from "@Interface/Query.js";
import type State from "@Interface/State.js";
/** The workspace_map operation (V4-1 §3.4): the top-level modules, the file
 * count, the entry points, the hot symbols. HOTNESS (the honest W1 proxy):
 * the graph has no reference counts (W2+), so a symbol is "hot" when its
 * file is imported by other files - the imports-edge in-degree. */
export declare const Map: (State_: State, Graph_: WorkspaceGraph, Request: {
    path?: string;
    depth?: number;
    cursor?: string;
}) => MapResult;
/** The workspace_find operation (V4-1 §3.4): the matching nodes with id,
 * path, span, kind. Cursor pagination: resume strictly after the cursor id. */
export declare const Find: (State_: State, Graph_: WorkspaceGraph, Request: {
    name?: string;
    pattern?: string;
    kind?: Node["kind"];
    limit?: number;
    cursor?: string;
}) => FindResult;
/** The workspace_expand operation (V4-1 §3.4): the neighbors (references,
 * calls, imports, tests) around the focus node. The W1 graph serves the
 * contains/imports kinds it parses; requesting a deferred kind yields an
 * honest empty set, never a fake edge. */
export declare const Expand: (State_: State, Graph_: WorkspaceGraph, Request: {
    id: string;
    kinds?: string[];
    depth?: number;
}) => ExpandResult;
/** The workspace_context operation (V4-1 §3.4/§3.5): the orientation packet,
 * token-estimated against the budget. Budget overrun sets truncated - the
 * caller narrows the scope, the packet never silently exceeds the cap. */
export declare const Context: (State_: State, Graph_: WorkspaceGraph, Request: {
    id?: string;
    query?: string;
    budget?: number;
    version?: string;
}) => ContextResult;
