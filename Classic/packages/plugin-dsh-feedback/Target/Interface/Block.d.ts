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
