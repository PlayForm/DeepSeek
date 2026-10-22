// FeedbackBlock - one agent's honest signal, in the plan's block format
// (Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md section 1):
//
//   [HONEST FEEDBACK - <agent id> - <task> - <session>]
//   LIKED: ...
//   DISLIKED: ...
//   DELTAS: ...
//   TRANSFERRED: ...
//   READ-STATUS: unread / read-at <session>
//
// The block is the unit of the council knowledge: it is recorded at the
// agent's completion, transferred through the parentage mechanically, ALWAYS
// modified in the parent sessions (the parents append their own observations
// as deltas - never sanitized, never filtered), and read only when the
// recipient chooses.
export default interface FeedbackBlock {
	/** The agent that produced the block. */
	agentId: string;
	/** The task the agent was working on (the free-form label). */
	task: string;
	/** The session the block was produced in. */
	session: string;
	/** The genuine likes - the spec, the environment, the tools. */
	liked: string;
	/** The frictions - the ambiguities, the broken states, the concurrency. */
	disliked: string;
	/** The parent sessions' appends - the observations the passers added.
	 *  NEVER edited, only appended to (the honesty guarantee). */
	deltas: string[];
	/** The mechanical transfer chain, child -> parent -> grandparent. */
	transferred: string[];
	/** The recipient's choice: "unread" until someone opens it; "read-at
	 *  <session>" is recorded when the recipient reads it. */
	readStatus: string;
	/** The record timestamp (epoch ms). */
	at: number;
}
