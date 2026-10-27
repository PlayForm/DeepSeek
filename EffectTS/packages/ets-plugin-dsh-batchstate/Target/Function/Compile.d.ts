import type Member from "../Interface/Member.js";
import type Scope from "../Interface/Scope.js";
import type Snapshot from "../Interface/Snapshot.js";
import type State from "../Interface/State.js";
/** The surfaces another lane owns exclusively - the OFF-LIMITS list for one
 *  agent. A surface the agent shares with the owner is NOT off-limits (it
 *  is a shared overlap, reported by Scope). */
export declare const Off: (State: State, Agent: string) => string[];
/** The running members, queue order first (a non-queued member sorts by
 *  its activation timestamp). */
export declare const Running: (State: State) => Member[];
/** The idle members, in queue order. */
export declare const Idle: (State: State) => Member[];
/** The full snapshot (getState). */
export declare const Snapshot: (State: State) => Snapshot;
/** The compiled arbiter truth (the Gates block, plan section 7.1 item 2):
 *  the gates sorted by name, each `<name> <state>` plus the owning lane when
 *  one was reported - `GATES: none` when the board holds no gate. */
export declare const Gates: (State: State) => string;
/** The queue projection (the queue service's own compiled line, read
 *  read-only) - `QUEUE: none` when no queue service is mounted. */
export declare const Schedule: (State: State) => string;
/** The compiled scope view for one agent (getScope): the file-ownership
 *  matrix derived at call time - pre-baked conflict avoidance, never
 *  negotiated (plan section 7.2 item 1). */
export declare const Scope: (State: State, Agent: string) => Scope;
/** The compiled dynamic context block for one agent (getContext): the
 *  table of contents + the scope reminders + the pending list - what gets
 *  spliced (plan section 2.2). READ-ONLY for the agents: the block is the
 *  injected context, clearly delimited, never their own content. */
export declare const Context: (State: State, Agent: string) => string;
/** The concurrent lanes' CURRENT activities for one agent (whoElse): the
 *  "you are never alone" block (plan section 2.1). */
export declare const Else: (State: State, Agent: string) => string;
