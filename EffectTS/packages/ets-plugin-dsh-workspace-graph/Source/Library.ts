// Library - the entry module of the WORKSPACE GRAPH
// (@playform/plugin-dsh-workspace-graph). Loader contract, CLASS form (the
// brief's section 3): `export default class WorkspaceGraph extends Service`
// with `super(Context, "workspaceGraph")` (the service registers immediately
// on construction and is removed with its owning fiber) and
// `static inject = ["fs", "storage"]` (the fs seam for every read, the
// storage hub for the KV domain). `static Config` carries the Schemastery
// schema so the loader validates and defaults the config before the class
// runs; the ONLY other named exports are the TYPE re-exports (the consumer
// contract, the factory's P0-1 pattern) - every other module is a nameless
// default export composed Rust-style, and each service method is a thin
// delegate to one Function module.
//
// THE SERVICE SURFACE (ctx.workspaceGraph, the brief's section 4.3):
//
//   indexFile(path)   - resolve, stat, gate, read, parse, store, bump, ledger
//   removeFile(path)  - delete the record, bump, ledger
//   getNode(id)       - the node by stable id
//   find(query)       - name/pattern/kind filtered, limit clamped
//   expand(id, opts)  - outgoing BFS, depth default 1 capped at 3
//   snapshot()        - the loadAll read (invalid records skipped and counted)
//   statistics()      - files, nodes, edges, indexRevision
//
// THE CONSTRUCTOR: unwrap the volatile config cells, run the fail-loud
// validation (Function/Validate - a bad config throws at construction, which
// is the class-form "at load"), attach the __workspaceGraphState probe (the
// family's smoke seam), ledger the byte-exact
// `graph: activated (domain=<domain>, languages=<n>)` line, and fire the
// best-effort storage-domain open (Function/Open) detached - its promise is
// kept on the state and awaited by the async writers, so the store behavior
// is deterministic without a sleep.
//
// DECLARATION MERGING: the module augments the cordis Context with
// `workspaceGraph: WorkspaceGraph`, so `ctx.workspaceGraph` is a typed
// accessor (the brief's section 4.3; the compile proof lives in the smoke).
//
// THE IDLE-FOREVER POSTURE: the plugin ships disabled (the schema default
// and the patch row); with config enabled=false the service still registers
// and `indexFile` skips with the byte-exact `skipped <path> (disabled)` line.
import { Service, type Context } from "@deepseek-ai/cordis";
import Append from "@Function/Append.js";
import ExpandFn from "@Function/Expand.js";
import FindFn from "@Function/Find.js";
import GetNodeFn from "@Function/GetNode.js";
import IndexFileFn from "@Function/Index.js";
import OpenStorage from "@Function/Open.js";
import RemoveFileFn from "@Function/Remove.js";
import SnapshotFn from "@Function/Snapshot.js";
import StatisticsFn from "@Function/Statistics.js";
import Unwrap from "@Function/Unwrap.js";
import ValidateFn from "@Function/Validate.js";
import type { EdgeKind } from "@Interface/Edge.js";
import type Expansion from "@Interface/Expansion.js";
import type Node from "@Interface/Node.js";
import type Outcome from "@Interface/Outcome.js";
import type Query from "@Interface/Query.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";
import Definition from "@Variable/Config.js";

// The named TYPE exports (the consumer contract): the brief's section 4.3
// schema, re-exported from the entry so consumers can import them instead of
// mirroring the shapes locally.
export type { default as Node } from "@Interface/Node.js";
export type { default as Edge } from "@Interface/Edge.js";
export type { default as Outcome } from "@Interface/Outcome.js";
export type { default as Query } from "@Interface/Query.js";
export type { default as Expansion } from "@Interface/Expansion.js";
export type { default as Snapshot } from "@Interface/Snapshot.js";
export type { default as Statistics } from "@Interface/Statistics.js";

export default class WorkspaceGraph extends Service {
	static inject = ["fs", "storage"];

	static Config = Definition;

	/** The internal runtime state (the __workspaceGraphState probe seam). */
	State: State;

	constructor(Context: Context, Raw?: unknown) {
		super(Context, "workspaceGraph");
		const Plain = Unwrap(Raw ?? Definition({}));
		this.State = {
			Context,
			Config: ValidateFn(Plain as Record<string, unknown>),
			Records: new Map(),
			Revision: 0,
			Domain: undefined,
			Opened: undefined,
			Ledger: "",
			Invalid: 0,
			SkippedImports: 0,
		};
		(Context as { __workspaceGraphState?: State }).__workspaceGraphState = this.State;
		Append(
			this.State,
			`activated (domain=${this.State.Config.domain}, languages=${this.State.Config.languages.length})`,
		);
		this.State.Opened = OpenStorage(this.State);
	}

	/** Resolve, stat, gate, read, parse, store the record, bump, ledger. */
	async indexFile(Path: string): Promise<Outcome> {
		return IndexFileFn(this.State, Path);
	}

	/** Delete the record, bump the revision, ledger the removed line. */
	async removeFile(Path: string): Promise<boolean> {
		return RemoveFileFn(this.State, Path);
	}

	/** The node by stable id, or undefined. */
	getNode(Id: string): Node | undefined {
		return GetNodeFn(this.State, Id);
	}

	/** The filtered node list, the limit clamped to [0, limitMaximum]. */
	find(Query?: Query): Node[] {
		return FindFn(this.State, Query);
	}

	/** The outgoing breadth-first expansion, depth default 1 capped at 3. */
	expand(Id: string, Options?: { kinds?: EdgeKind[]; depth?: number }): Expansion {
		return ExpandFn(this.State, Id, Options);
	}

	/** The loadAll read; a record that fails validation is skipped and counted. */
	snapshot(): Snapshot {
		return SnapshotFn(this.State);
	}

	/** The counts: files, nodes, edges, indexRevision. */
	statistics(): Statistics {
		return StatisticsFn(this.State);
	}
}

declare module "@deepseek-ai/cordis" {
	interface Context {
		workspaceGraph: WorkspaceGraph;
	}
}
