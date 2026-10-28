import { Service, type Context } from "@deepseek-ai/cordis";
import type Packet from "../Interface/Packet.js";
import type Query from "../Interface/Query.js";
import type State from "../Interface/State.js";
export default class WorkspaceContext extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The orientation packet for one query (memoized; invalidated by the trace). */
    packet(Query_: Query): Packet;
    /** The available lens names (config `lenses`). */
    lenses(): string[];
    /** The caller's tracked focus, or undefined. */
    focusOf(Caller: string): {
        id: string;
        version: string;
    } | undefined;
    /** The service statistics. */
    statistics(): {
        packets: number;
        clamped: number;
        stale: number;
        budget: {
            target: number;
            maximum: number;
        };
    };
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-context service (registered from apply). */
        workspaceContext: WorkspaceContext;
    }
}
