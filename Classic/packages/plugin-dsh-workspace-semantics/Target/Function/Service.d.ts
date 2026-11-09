/**
 * @module Service
 *
 * The `workspaceSemantics` service: extends the cordis Service base and is
 * REGISTERED FROM APPLY.
 *
 * @remarks
 * The loader contract for the object-form plugin: apply constructs the service;
 * the Service base constructor calls ctx.reflect.provide("workspaceSemantics",
 * this), so `ctx.workspaceSemantics` resolves. Declaration merging at the end
 * of the file gives the typed accessor.
 *
 * The methods are thin delegates (one Function module each):
 *
 * ```
 * resolve(path)          - the model for the path, built lazily through the
 *                          file type's adapter (async - it may read the file);
 * symbol(path, name)     - the symbol lookup within the path's model;
 * references(path)       - the reference list of the path's model;
 * rename(path, span, to) - the per-adapter rename plan (async; refusal-to-guess
 *                          when the adapter refuses);
 * adapt(adapter)         - register an any-file adapter (per extension);
 * statistics()           - { paths, revision, adapters }.
 * ```
 */
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
