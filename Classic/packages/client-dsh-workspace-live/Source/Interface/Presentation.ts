/**
 * @module Presentation
 *
 * What the live view presents.
 *
 * @remarks
 * Documentation/Plans/Workspace-Family/LIVE.md: the presentations of the
 * Entity/Presentation/Interaction model. The live view NEVER conflates a
 * running OS process with a managed entity: a representation describes a
 * managed workspace entity and its latest observed state, not a process.
 *
 * A Representation is one presented entity: its stable id, its kind, its
 * label, the latest event sequence that changed it, and its observed
 * version. A LiveView snapshot is the ordered list of representations plus
 * the recent event tail (bounded by the Config maxEvents). The D5 trace tail
 * the tab also renders is a separate bounded source (`Interface/Trace.ts`),
 * so the snapshot shape stays what it always was.
 */
export type Representation = {
	/**
	 * The entity's stable id.
	 */
	id: string;
	/**
	 * The entity's kind.
	 */
	kind: "file" | "symbol" | "block" | "test" | "doc";
	/**
	 * The entity's displayed label.
	 */
	label: string;
	/**
	 * The entity's observed version.
	 */
	version: string;
	/**
	 * The latest event sequence that changed the entity.
	 */
	lastSequence: number;
};

/**
 * One live view snapshot: the ordered representations plus the recent event
 * tail.
 */
export type LiveView = {
	/**
	 * The snapshot's sequence watermark.
	 */
	sequence: number;
	/**
	 * The ordered presented entities.
	 */
	representations: Representation[];
	/**
	 * The recent event tail, newest last, bounded by the Config maxEvents.
	 */
	events: {
		operationId: string;
		parentId: string;
		category: string;
		path?: string;
		sequence: number;
	}[];
};
