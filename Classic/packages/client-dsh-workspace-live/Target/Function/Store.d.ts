import type { LiveView } from "@Interface/Presentation.js";
import type { GraphSnapshot, WorkspaceEvent } from "@Interface/Siblings.js";
export default function Store(config: {
    maxEvents: number;
    maxRepresentations: number;
}): {
    getSnapshot: () => LiveView;
    subscribe: (listener: () => void) => () => void;
    ingest: (event: WorkspaceEvent) => void;
    refresh: (graph: GraphSnapshot) => void;
};
