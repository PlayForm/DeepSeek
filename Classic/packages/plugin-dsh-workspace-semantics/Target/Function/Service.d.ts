import { Service, type Context } from "@deepseek-ai/cordis";
import type Adapter from "../Interface/Adapter.js";
import type Model from "../Interface/Model.js";
import type RenamePlan from "../Interface/RenamePlan.js";
import type Span from "../Interface/Span.js";
import type State from "../Interface/State.js";
import type SymbolNode from "../Interface/SymbolNode.js";
export default class WorkspaceSemantics extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The model for the path, built lazily through the adapter. */
    resolve(Path: string): Promise<Model | undefined>;
    /** The symbol lookup within the path's model. */
    symbol(Path: string, QualifiedName: string): SymbolNode | undefined;
    /** The reference list of the path's model. */
    references(Path: string): import("../Interface/ReferenceNode.js").default[];
    /** The per-adapter rename plan; undefined is the refusal-to-guess answer. */
    rename(Path: string, Span: Span, To: string): Promise<RenamePlan | undefined>;
    /** Register an any-file adapter (one per extension it owns). */
    adapt(Adapter: Adapter): void;
    /** The statistics triple. */
    statistics(): {
        paths: number;
        revision: number;
        adapters: number;
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-semantics service (registered from apply). */
        workspaceSemantics: WorkspaceSemantics;
    }
}
