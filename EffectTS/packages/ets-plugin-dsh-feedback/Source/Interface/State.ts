// State - the service's runtime state, built once in the constructor. The
// in-memory council map is keyed per session; the durable record is the
// ledger file (one log per module).
import type { Context } from "@deepseek-ai/cordis";

import type FeedbackBlock from "./Block.js";
import type Config from "./Config.js";

/** The per-session council slice: the blocks by agent id, in record order. */
export interface SessionRecord {
	blocks: Map<string, FeedbackBlock>;
	order: string[];
}

export default interface State {
	/** The config-derived knobs (the schema's validated runtime shape). */
	Config: Config;
	/** The loading context - carries logger, emit and the event bus. */
	Context: Context;
	/** The module identity - the ledger prefix for every line. */
	Module: string;
	/** Ledger file (one global log per module). */
	Ledger: string;
	/** Ledger enabled - write the durable log file. */
	Enabled: boolean;
	/** session id → the session's blocks (by agent id). */
	Sessions: Map<string, SessionRecord>;
	/** Insertion order of sessions, for the maxSessions eviction. */
	Order: string[];
}
