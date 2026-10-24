// Event - the journal event names (Function/Journal, Function/Outcome).
// `batch` is the batch outcome's line (the caller-side orchestration
// integration); the rest are the block events.
type Event = "recorded" | "pushed" | "delta" | "read" | "dropped" | "restored" | "batch";

export type { Event };
