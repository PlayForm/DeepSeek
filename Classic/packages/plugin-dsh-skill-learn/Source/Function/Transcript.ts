/**
 * @module Transcript
 *
 * The live session's derived history, projected onto the plugin's message shape, with
 * the tool-call count the trigger's interval reads.
 *
 * @remarks
 * WHY THE ACCESSOR IS `deriveMessages()` AND NOTHING ELSE: the sibling package reads
 * `Session.surface.messages`, which does not exist, so its 35 recorded reviews all ended
 * `unavailable` at the empty-snapshot gate
 * (`Classic/packages/plugin-dsh-lesson-review/Source/Function/Snapshot.ts:90`,
 * `Temporary/Research/DESIGN-BRIEF.md:1-24`). `Session.deriveMessages()` is the real
 * history accessor (`dsh-session/lib/types/index.d.ts:347`), and the loop itself calls
 * it at `dsh-agent-loop/lib/index.js:1274`. There is no second probe and no fallback:
 * one accessor, one shape.
 *
 * THE PROJECTION IS DEFENSIVE BECAUSE THE INPUT IS TYPED BY US, NOT BY THE HARNESS.
 * `Interface/Agent.ts` declares the shape this package reads, and the service narrows
 * `unknown` to it by cast, so a fake session in a smoke and a real one at runtime both
 * arrive as the same declared type. A row that does not carry a known role or a block
 * list is dropped here rather than handed to the digest, because the digest's line
 * rules are defined over roles and blocks and have no arm for "a row that is not a
 * message".
 *
 * THE COUNT IS BLOCKS, NOT MESSAGES. `intervalIterations` bounds "tool-call blocks
 * since the last review" (plan section 9, key 14), which is the Hermes
 * `_iters_since_skill` counter's unit (`agent/turn_iteration_prep.py:165-167`).
 * Counting assistant messages that happen to contain a call would undercount a turn
 * that made three calls in one step, which is exactly the turn the interval exists to
 * notice.
 *
 * A THROW FROM THE SESSION IS AN EMPTY TRANSCRIPT, NOT A CRASH. A disposed or
 * still-loading session can reject the derivation; the review's vocabulary has no
 * "transcript failed" class and does not need one, because a run that cannot read the
 * history has nothing to review and `empty-transcript` is the honest outcome (plan
 * section 3.2).
 */
import type Agent from "@Interface/Agent.js";
import type Message from "@Interface/Message.js";
import type { ContentBlock } from "@Interface/Message.js";

/** The projection result: the messages, and how many tool calls they carry. */
export interface TranscriptResult {
	/** Every message that carries a known role and a block list, in order. */
	readonly messages: readonly Message[];
	/** The number of `tool-call` blocks across the whole transcript. */
	readonly toolCalls: number;
}

/** The roles the harness's message map closes over (`dsh-llm/lib/types/message.d.ts:139-172`). */
const Roles: readonly Message["role"][] = ["system", "user", "assistant", "tool", "developer"];

/** One row, projected; `undefined` when the row is not a message this plugin reads. */
const Project = (
	Entry: Message,
): { readonly message: Message; readonly toolCalls: number } | undefined => {
	switch (true) {
		case !Roles.includes(Entry?.role):
			return undefined;
		default:
			break;
	}
	const Content: readonly ContentBlock[] = Array.isArray(Entry.content) ? Entry.content : [];
	const Blocks: ContentBlock[] = [];
	let ToolCalls = 0;
	for (const Block of Content) {
		if (Block.type === "text" && typeof Block.text === "string") {
			Blocks.push({ type: "text", text: Block.text });
			continue;
		}
		if (Block.type === "tool-call") {
			ToolCalls += 1;
			Blocks.push(
				typeof Block.name === "string"
					? { type: "tool-call", name: Block.name }
					: { type: "tool-call" },
			);
		}
	}
	return { message: { role: Entry.role, content: Blocks }, toolCalls: ToolCalls };
};

/** The derived history, or nothing when the session refuses to derive it. */
const Derive = (Agent: Agent): readonly Message[] => {
	try {
		return Agent.session.deriveMessages();
	} catch {
		return [];
	}
};

export default (Agent: Agent): TranscriptResult => {
	const Derived = Derive(Agent);
	const Messages: Message[] = [];
	let ToolCalls = 0;
	for (const Entry of Derived) {
		const Projected = Project(Entry);
		if (Projected === undefined) continue;
		Messages.push(Projected.message);
		ToolCalls += Projected.toolCalls;
	}
	return { messages: Messages, toolCalls: ToolCalls };
};
