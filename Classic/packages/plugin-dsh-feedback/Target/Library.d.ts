import { Service, type Context } from "@deepseek-ai/cordis";
import type FeedbackBlock from "./Interface/Block.js";
import type Config from "./Interface/Config.js";
import type Summary from "./Interface/Summary.js";
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
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
        logFile: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        maxBlockBytes: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxChain: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        maxSessions: import("@deepseek-ai/schemastery").default<number, number, "defined">;
        summaryTerms: import("@deepseek-ai/schemastery").default<number, number, "defined">;
    }>>, "plain">;
    private State;
    constructor(Context: Context, Config: Config);
    /** Store a block (the agent's own completion footer) in its session's
     *  record and journal the event. */
    Record(Block: FeedbackBlock): void;
    /** The mechanical transfer hop: forward the block to the parent session's
     *  record, one hop added to the TRANSFERRED chain. */
    Push(Block: FeedbackBlock, ParentSession: string): void;
    /** The parent's append: add a delta observation to a stored block. */
    Delta(Session: string, AgentId: string, Text: string): FeedbackBlock | null;
    /** The recipient's optional read: record `read-at <reader>` on a block. */
    Read(Session: string, AgentId: string, Reader: string): FeedbackBlock | null;
    /** The council view: the session's aggregate signals. */
    Summary(Session: string): Summary;
    /** Render one block in the transfer format (the queue integration's
     *  footer builder). */
    Render(Block: FeedbackBlock): string;
}
export { BLOCK as BlockMarker };
