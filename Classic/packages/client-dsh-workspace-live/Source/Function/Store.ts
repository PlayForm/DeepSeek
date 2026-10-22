// Store - the live view's presentation store. THE STABLE-UNTIL-EVENT
// CONTRACT (Documentation/Plans/Workspace-Family/LIVE.md): the presentation
// does NOT re-render continuously - getSnapshot() returns the same object
// reference until ingest() applies an event or a graph refresh, and only
// then a new snapshot is emitted to the subscribers. There is no polling
// and no timer: the machinery behind the view stays invisible; the view
// presents at the end of the invisible flow.
//
// ingest(event) folds a workspace event into the snapshot: the event joins
// the bounded tail (oldest dropped beyond Config maxEvents), and an event
// with a path updates (or creates) the representation for that path with
// the event's sequence. refresh(graph) replaces the representation set from
// a graph snapshot (the end-phase wiring passes the real
// ctx.workspaceGraph.snapshot(); the PoC type mirrors it from
// Interface/Siblings).
import type { LiveView, Representation } from "@Interface/Presentation.js";
import type { GraphSnapshot, WorkspaceEvent } from "@Interface/Siblings.js";

export default function Store(config: { maxEvents: number; maxRepresentations: number }): {
	getSnapshot: () => LiveView;
	subscribe: (listener: () => void) => () => void;
	ingest: (event: WorkspaceEvent) => void;
	refresh: (graph: GraphSnapshot) => void;
} {
	let Snapshot: LiveView = { sequence: 0, representations: [], events: [] };
	const Listeners = new Set<() => void>();

	const Emit = (next: LiveView): void => {
		Snapshot = next;
		for (const Listener of Listeners) Listener();
	};

	return {
		getSnapshot: () => Snapshot,
		subscribe(Listener) {
			Listeners.add(Listener);
			return () => Listeners.delete(Listener);
		},
		ingest(event) {
			const events = [...Snapshot.events, event].slice(-config.maxEvents);
			let representations = Snapshot.representations;
			if (event.path !== undefined) {
				const existing = representations.find((item) => item.id === `file:${event.path}`);
				const updated: Representation = existing
					? { ...existing, lastSequence: event.sequence }
					: {
							id: `file:${event.path}`,
							kind: "file",
							label: event.path,
							version: "unknown",
							lastSequence: event.sequence,
						};
				representations = [
					...representations.filter((item) => item.id !== updated.id),
					updated,
				].slice(-config.maxRepresentations);
			}
			Emit({
				sequence: Math.max(Snapshot.sequence, event.sequence),
				representations,
				events,
			});
		},
		refresh(graph) {
			const representations = graph.nodes
				.map((node): Representation => ({
					id: node.id,
					kind:
						node.kind === "DocSection"
							? "doc"
							: (node.kind.toLowerCase() as Representation["kind"]),
					label: node.name ?? node.path,
					version: node.version,
					lastSequence: Snapshot.sequence,
				}))
				.slice(0, config.maxRepresentations);
			Emit({ ...Snapshot, representations });
		},
	};
}
