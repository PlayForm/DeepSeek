// Nodes - the workspace graph's `Test` nodes for one package: the index's
// record of the suite files the package carries. The graph is OPTIONAL here
// (the hook does not inject it - a repo without the graph must still
// reconcile), so the service is PROBED through `ctx.get`, never accessed
// through an inject-bound accessor, and every failure is an empty list.
//
// A node BELONGS to the package when its path (as the graph stores it: the
// resolved display path, or a path relative to the workspace root, or one
// relative to the package root) points inside the package. The reconciliation
// uses these nodes for ONE purpose: a node whose file is gone is a claim the
// tree no longer supports (the index outlived the suite).
import { relative, sep } from "node:path";

import type { Context } from "@deepseek-ai/cordis";

/** The graph's find query shape (the subset this hook uses). */
interface Query {
	kind: string;
	limit: number;
}

/** Whether a graph node path points inside the package. */
const Belongs = (NodePath: string, PackageRoot: string, Root: string): boolean => {
	const Normalized = NodePath.split(sep).join("/");
	const Package_ = `${PackageRoot.split(sep).join("/")}/`;
	const Inside = relative(Root, PackageRoot).split(sep).join("/");
	return [
		Package_,
		Inside.length > 0 && !Inside.startsWith("..") ? `${Inside}/` : undefined,
		"Source/Test/",
	].some((Prefix) => Prefix !== undefined && Normalized.startsWith(Prefix));
};

export default (
	/** The plugin context (the optional-service probe). */
	Context: Context,
	/** The package root the nodes must sit under. */
	PackageRoot: string,
	/** The resolved workspace root. */
	Root: string,
): string[] => {
	try {
		const Service = Context.get?.("workspaceGraph") as
			{ find?: (Query: Query) => unknown } | undefined;
		if (Service === undefined || typeof Service.find !== "function") {
			return [];
		}
		const Found = Service.find({ kind: "Test", limit: 1000 });
		switch (true) {
			case !Array.isArray(Found):
				return [];
			default:
		}
		return Found.flatMap((Node_: unknown) => {
			const Path = (Node_ as { path?: unknown } | undefined)?.path;
			return typeof Path === "string" && Belongs(Path, PackageRoot, Root) ? [Path] : [];
		});
	} catch {
		return [];
	}
};
