import { Service, type Context } from "@deepseek-ai/cordis";
import type FeedbackBlock from "./Interface/Block.js";
import type Config from "./Interface/Config.js";
import type Outcome from "./Interface/Outcome.js";
import type Summary from "./Interface/Summary.js";
import Version from "./Variable/Version.js";
/**
 * @module Library
 *
 * The entry module of the FEEDBACK member (@playform/plugin-dsh-feedback,
 * ctx.feedback), the fourth orchestration member
 * (Documentation/Plans/HONEST-FEEDBACK-PLUGIN.md).
 *
 * @remarks
 *
 * Class form (the factory's precedent): `export default class Feedback extends
 * Service` with `super(Context, "feedback")`, registered immediately on
 * construction and removed with its owning fiber; `static inject` declares
 * nothing beyond the plugin's own needs (the feedback member is a NON-MANIFEST
 * module - no fs/observed machinery, no waterfall listeners).
 *
 * THE SERVICE SURFACE (ctx.feedback - every signature documented in README.md
 * / SCHEME.md):
 *
 * - Record(block) - store a block in the session's record + journal it
 * - Push(block, parentSession) - the mechanical transfer hop through the
 *   parentage
 * - Delta(session, agentId, text) - the parent's append (never an edit)
 * - Read(session, agentId, reader) - the recipient's OPTIONAL read (never
 *   forced)
 * - Summary(session) - the council view: the aggregate signals
 * - Outcome(session, agentId, proposal, outcome, detail) - the batch outcome's
 *   journal + summary record (the caller-side orchestration integration)
 *
 * THE HONESTY POLICY (plan section 6): the honest content is NEVER sanitized
 * or filtered - the parents append deltas, NEVER rewrite the agents' signals.
 * The read is ALWAYS the recipient's choice. The user's override wins.
 *
 * THE TRANSFER MECHANISM (plan section 4.1): the block travels as TEXT through
 * the inbox machinery - a child's completion report carries the block, the
 * parent's session/event listener sees the splice and records it WITHOUT
 * reading it into the conversation; each session boundary adds one hop to the
 * TRANSFERRED chain. The queue integration (end-phase) can also call Push
 * directly.
 */
declare const BLOCK = "[HONEST FEEDBACK";
export default class Feedback extends Service {
    static inject: string[];
    static Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxBlockBytes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxChain: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxSessions: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        summaryTerms: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxOutcomes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxBlockBytes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxChain: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxSessions: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        summaryTerms: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxOutcomes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        policy: import("@deepseek-ai/schemastery").default<NoInfer<Schemastery.ObjectS<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, NoInfer<Schemastery.ObjectT<NoInfer<{
            read: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            index: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            record: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            suggest: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            write: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            commit: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            spawn: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
            message: import("@deepseek-ai/schemastery").default<"approve" | "auto", "approve" | "auto", "defined">;
        }>>>, "volatile">;
    }>>, "plain">;
    private State;
    constructor(Context: Context, Config: Config);
    /**
     * Store a block (the agent's own completion footer) in its session's
     * record and journal the event.
     */
    Record(Block: FeedbackBlock): void;
    /**
     * The mechanical transfer hop: forward the block to the parent session's
     * record, one hop added to the TRANSFERRED chain.
     */
    Push(Block: FeedbackBlock, ParentSession: string): void;
    /**
     * The parent's append: add a delta observation to a stored block.
     */
    Delta(Session: string, AgentId: string, Text: string): FeedbackBlock | null;
    /**
     * The recipient's optional read: record `read-at <reader>` on a block.
     */
    Read(Session: string, AgentId: string, Reader: string): FeedbackBlock | null;
    /**
     * The council view: the session's aggregate signals.
     */
    Summary(Session: string): Summary;
    /**
     * Record one batch outcome (applied / rejected / denied / expired) into
     * the session's journal and summary - the caller-side orchestration
     * integration the plan defers (the ingester is the outcome's owner).
     */
    Outcome(Session: string, AgentId: string, Proposal: string, Outcome_: string, Detail: string): Outcome | null;
    /**
     * Render one block in the transfer format (the queue integration's footer
     * builder).
     */
    Render(Block: FeedbackBlock): string;
}
export { BLOCK as BlockMarker };
/**
 * The compiled package version (Source/Variable/Version, built in by the
 * ESBuild define) - NOT a loader key: the contract's names are unchanged (the
 * class form's default export with static inject/Config), and Version sits
 * beside the other named exports, not on the class.
 */
export { Version };
