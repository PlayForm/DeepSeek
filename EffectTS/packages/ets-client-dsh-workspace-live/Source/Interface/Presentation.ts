// Presentation - what the live view presents (Documentation/Plans/
// Workspace-Family/LIVE.md: the presentations of the Entity/Presentation/
// Interaction model). The live view NEVER conflates a running OS process
// with a managed entity: a representation describes a managed workspace
// entity and its latest observed state, not a process.
//
// A Representation is one presented entity: its stable id, its kind, its
// label, the latest event sequence that changed it, and its observed
// version. A LiveView snapshot is the ordered list of representations plus
// the recent event tail (bounded by the Config maxEvents) - everything the
// tab renders, and nothing else.
export type Representation = {
	id: string;
	kind: "file" | "symbol" | "block" | "test" | "doc";
	label: string;
	version: string;
	lastSequence: number;
};

export type LiveView = {
	sequence: number;
	representations: Representation[];
	events: {
		operationId: string;
		parentId: string;
		category: string;
		path?: string;
		sequence: number;
	}[];
};
