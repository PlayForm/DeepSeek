// Library - the entry module of the FEEDBACK member
// (@playform/plugin-dsh-feedback, ctx.feedback), the fourth orchestration member
// (Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md). Class form (the factory's
// precedent): `export default class Feedback extends Service` with
// `super(Context, "feedback")`, registered immediately on construction and
// removed with its owning fiber; `static inject` declares nothing beyond the
// plugin's own needs (the feedback member is a NON-MANIFEST module - no fs/
// observed machinery, no waterfall listeners).
//
// THE SERVICE SURFACE (ctx.feedback - every signature documented in
// README.md / SCHEME.md):
//
//   Record(block)                 - store a block in the session's record + journal it
//   Push(block, parentSession)    - the mechanical transfer hop through the parentage
//   Delta(session, agentId, text) - the parent's append (never an edit)
//   Read(session, agentId, reader)- the recipient's OPTIONAL read (never forced)
//   Summary(session)              - the council view: the aggregate signals
//   Outcome(session, agentId, proposal, outcome, detail)
//                                 - the batch outcome's journal + summary record
//                                   (the caller-side orchestration integration)
//
// THE HONESTY POLICY (plan section 6): the honest content is NEVER sanitized
// or filtered - the parents append deltas, NEVER rewrite the agents'
// signals. The read is ALWAYS the recipient's choice. The user's override
// wins.
//
// THE TRANSFER MECHANISM (plan section 4.1): the block travels as TEXT
// through the inbox machinery - a child's completion report carries the
// block, the parent's session/event listener sees the splice and records it
// WITHOUT reading it into the conversation; each session boundary adds one
// hop to the TRANSFERRED chain. The queue integration (end-phase) can also
// call Push directly.
import { homedir as Home } from "node:os";

import { Service, type Context } from "@deepseek-ai/cordis";
import type { Allowlist } from "@playform/ets-plugin-dsh-factory";

import Delta from "./Function/Delta.js";
import OutcomeFn from "./Function/Outcome.js";
import Parse from "./Function/Parse.js";
import PushFn from "./Function/Push.js";
import ReadFn from "./Function/Read.js";
import RecordFn from "./Function/Record.js";
import Render from "./Function/Render.js";
import SummaryFn from "./Function/Summary.js";
import type FeedbackBlock from "./Interface/Block.js";
import type Config from "./Interface/Config.js";
import type Outcome from "./Interface/Outcome.js";
import type State from "./Interface/State.js";
import type Summary from "./Interface/Summary.js";
import Definition from "./Variable/Config.js";
import Version from "./Variable/Version.js";

const BLOCK = "[HONEST FEEDBACK";

export default class Feedback extends Service {
	static inject: string[] = [];

	static Config = Definition;

	private State: State;

	constructor(Context: Context, Config: Config) {
		super(Context, "feedback");
		const Ledger = Config.logFile.startsWith("~")
			? `${Home()}${Config.logFile.slice(1)}`
			: Config.logFile;
		// THE POLICY BLOCK (D6) is a VOLATILE cell in the schema (the factory's
		// shared block); the class form has no factory State builder to unwrap
		// it, so the block is normalized ONCE here - a config edit reloads the
		// plugin anyway (the class form's documented posture).
		const Allow: Allowlist =
			(Config.policy as unknown as { get?: () => Allowlist }).get?.() ?? Config.policy;
		this.State = {
			Config: { ...Config, policy: Allow },
			Context,
			Module: "plugin-dsh-feedback",
			Ledger,
			Enabled: Config.enabled,
			Sessions: new Map(),
			Order: [],
			Outcomes: new Map(),
		};
		// The passive pickup: a block that arrives as an inbox splice (the
		// child -> parent transfer) is recorded into the receiving session's
		// record WITHOUT being read into the conversation. Fail-open: the
		// listener never throws into the emit dispatch. The registration is
		// typed through a minimal local shape (the session/event vocabulary
		// is declared by the host's dsh-session, not by this package).
		const On = Context.on as unknown as (
			Name: string,
			Fn: (Subject: unknown, Event: { type?: string; data?: unknown }) => void,
		) => void;
		On("session/event", (_Subject: unknown, Event: { type?: string; data?: unknown }) => {
			try {
				switch (true) {
					case !this.State.Enabled:
					case Event.type !== "agent/inbox/spliced":
						return;
				}
				const Data = Event.data as
					{ inserted?: { content?: { type?: string; text?: string }[] }[] } | undefined;
				for (const Message of Data?.inserted ?? []) {
					const Text = (Message?.content ?? [])
						.filter((Part) => Part?.type === "text")
						.map((Part) => Part?.text ?? "")
						.join("");
					if (!Text.includes(BLOCK)) {
						continue;
					}
					const Parsed = Parse(Text);
					if (Parsed !== null) {
						RecordFn(this.State, Parsed);
					}
				}
			} catch {
				/* fail-open */
			}
		});
	}

	/** Store a block (the agent's own completion footer) in its session's
	 *  record and journal the event. */
	Record(Block: FeedbackBlock): void {
		RecordFn(this.State, Block);
	}

	/** The mechanical transfer hop: forward the block to the parent session's
	 *  record, one hop added to the TRANSFERRED chain. */
	Push(Block: FeedbackBlock, ParentSession: string): void {
		PushFn(this.State, Block, ParentSession);
	}

	/** The parent's append: add a delta observation to a stored block. */
	Delta(Session: string, AgentId: string, Text: string): FeedbackBlock | null {
		return Delta(this.State, Session, AgentId, Text);
	}

	/** The recipient's optional read: record `read-at <reader>` on a block. */
	Read(Session: string, AgentId: string, Reader: string): FeedbackBlock | null {
		return ReadFn(this.State, Session, AgentId, Reader);
	}

	/** The council view: the session's aggregate signals. */
	Summary(Session: string): Summary {
		return SummaryFn(this.State, Session);
	}

	/** Record one batch outcome (applied / rejected / denied / expired) into
	 *  the session's journal and summary - the caller-side orchestration
	 *  integration the plan defers (the ingester is the outcome's owner). */
	Outcome(
		Session: string,
		AgentId: string,
		Proposal: string,
		Outcome_: string,
		Detail: string,
	): Outcome | null {
		return OutcomeFn(this.State, Session, AgentId, Proposal, Outcome_, Detail);
	}

	/** Render one block in the transfer format (the queue integration's
	 *  footer builder). */
	Render(Block: FeedbackBlock): string {
		return Render(Block, this.State.Config.maxBlockBytes);
	}
}

export { BLOCK as BlockMarker };

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define) - NOT a loader key: the contract's names are unchanged
// (the class form's default export with static inject/Config), and Version
// sits beside the other named exports, not on the class.
export { Version };
