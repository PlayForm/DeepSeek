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
// THE SERVICE SURFACE (ctx.workspaceGraph, the brief's section 4.3 plus the
// INDEXING TRIGGER the later stages needed):
//
//   indexFile(path)   - resolve, stat, gate, read, parse, store, bump, ledger
//   indexWorkspace(root?, { maxFiles? })
//                     - the walk + per-file indexFile, the counts out (the
//                       indexing trigger: it fills the graph in one call)
//   removeFile(path)  - delete the record, bump, ledger
//   getNode(id)       - the node by stable id
//   find(query)       - name/pattern/kind filtered, limit clamped
//   expand(id, opts)  - outgoing BFS, depth default 1 capped at 3
//   neighborhood(path, limit?)
//                     - the connected component the graph-suggester consumes
//   snapshot()        - the loadAll read (invalid records skipped and counted)
//   statistics()      - files, nodes, edges, indexRevision
//
// THE CONSTRUCTOR: unwrap the volatile config cells, run the fail-loud
// validation (Function/Validate - a bad config throws at construction, which
// is the class-form "at load"), attach the __workspaceGraphState probe (the
// family's smoke seam), ledger the byte-exact
// `graph: activated (domain=<domain>, languages=<n>)` line, fire the
// best-effort storage-domain open (Function/Open) detached - its promise is
// kept on the state and awaited by the async writers, so the store behavior
// is deterministic without a sleep - and, when enabled, wire the TRACE
// ADAPTER (Trace/Adapter): the graph consumes `observe/stamp` from the
// family's bus (`ctx.trace`, provided by the factory) instead of registering
// `ctx.root.on("fs/observed")` directly, and emits `graph/indexed` /
// `graph/invalidated`. The indexer is inferred from the bus - there is no
// separate process and no separate indexer plugin (D5).
//
// DECLARATION MERGING: the module augments the cordis Context with
// `workspaceGraph: WorkspaceGraph`, so `ctx.workspaceGraph` is a typed
// accessor (the brief's section 4.3; the compile proof lives in the smoke).
//
// THE IDLE-FOREVER POSTURE: the plugin ships disabled (the schema default
// and the patch row); with config enabled=false the service still registers,
// `indexFile` skips with the byte-exact `skipped <path> (disabled)` line, and
// NO listener is wired (a disabled graph hears nothing).
import { Service, type Context } from "@deepseek-ai/cordis";
import Append from "@Function/Append.js";
import ExpandFn from "@Function/Expand.js";
import FindFn from "@Function/Find.js";
import GetNodeFn from "@Function/GetNode.js";
import IndexFileFn from "@Function/Index.js";
import NeighborhoodFn from "@Function/Neighborhood.js";
import OpenStorage from "@Function/Open.js";
import RemoveFileFn from "@Function/Remove.js";
import SnapshotFn from "@Function/Snapshot.js";
import StatisticsFn from "@Function/Statistics.js";
import Unwrap from "@Function/Unwrap.js";
import ValidateFn from "@Function/Validate.js";
import WorkspaceFn from "@Function/Workspace.js";
import type { EdgeKind } from "@Interface/Edge.js";
import type Expansion from "@Interface/Expansion.js";
import type IndexSummary from "@Interface/IndexSummary.js";
import type Neighborhood from "@Interface/Neighborhood.js";
import type Node from "@Interface/Node.js";
import type Outcome from "@Interface/Outcome.js";
import type Query from "@Interface/Query.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";
import type { Allowlist } from "@playform/plugin-dsh-factory";
import Definition from "@Variable/Config.js";
import Version from "@Variable/Version.js";

import Adapter from "./Trace/Adapter.js";

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
export type { default as IndexSummary } from "@Interface/IndexSummary.js";
export type { default as Neighborhood } from "@Interface/Neighborhood.js";

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's names are unchanged
// (the class form's default export with static inject/Config), and Version
// sits beside the other named exports, not on the class.
export { Version };

export default class WorkspaceGraph extends Service {
	static inject = ["fs", "storage"];

	static Config = Definition;

	/** The internal runtime state (the __workspaceGraphState probe seam). */
	State: State;

	constructor(Context: Context, Raw?: unknown) {
		super(Context, "workspaceGraph");
		const Plain = Unwrap(Raw ?? Definition({}));
		// THE POLICY BLOCK (D6): the schema composes the shared block; the
		// plain Configuration stays the frozen W1 table (no hidden knobs), so
		// the block rides straight onto State.Allow (the family convention). A
		// raw config that bypasses the schema falls back to the schema's own
		// defaults.
		const Allow =
			(Plain["policy"] as Allowlist | undefined) ??
			(Definition({}) as unknown as { policy: { get: () => Allowlist } }).policy.get();
		this.State = {
			Context,
			Config: ValidateFn(Plain as Record<string, unknown>),
			Allow,
			Records: new Map(),
			Revision: 0,
			Domain: undefined,
			Opened: undefined,
			Ledger: "",
			Invalid: 0,
			SkippedImports: 0,
			Loop: undefined,
			Flush: Promise.resolve(),
		};
		(Context as { __workspaceGraphState?: State }).__workspaceGraphState = this.State;
		Append(
			this.State,
			`activated (domain=${this.State.Config.domain}, languages=${this.State.Config.languages.length})`,
		);
		this.State.Opened = OpenStorage(this.State);
		if (this.State.Config.enabled) {
			Adapter(this.State);
		}
	}

	/** Resolve, stat, gate, read, parse, store the record, bump, ledger. */
	async indexFile(Path: string): Promise<Outcome> {
		return IndexFileFn(this.State, Path);
	}

	/** Walk the root (default: the session cwd) and index every candidate. */
	async indexWorkspace(Root?: string, Options?: { maxFiles?: number }): Promise<IndexSummary> {
		return WorkspaceFn(this.State, Root, Options);
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

	/** The connected component around an anchor file (the suggester's read). */
	neighborhood(Path: string, Limit?: number): Neighborhood[] {
		return NeighborhoodFn(this.State, Path, Limit);
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
