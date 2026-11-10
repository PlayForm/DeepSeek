/**
 * @module ToolStatus
 *
 * The `queue_status` tool: the queue record's surface.
 *
 * @remarks
 * The surface covers the active lanes and their tasks, the queued lanes, and
 * the board line. One canonical JSON value; the presenter is pure.
 */
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State): {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {};
    };
    exec(): {
        ok: boolean;
        error: string;
        board?: never;
        tasks?: never;
    } | {
        error?: never;
        ok: boolean;
        board: string;
        tasks: {
            id: string;
            state: import("../Interface/Task.js").TaskState;
            priority: number;
            agent: string | undefined;
            route: string | undefined;
        }[];
    };
};
