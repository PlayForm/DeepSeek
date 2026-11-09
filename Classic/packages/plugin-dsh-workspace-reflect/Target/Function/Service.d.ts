import { Service, type Context } from "@deepseek-ai/cordis";
import type { Operation } from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";
export default class WorkspaceReflect extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The reflective rename: one call across the affected references. */
    rename(Operation: Extract<Operation, {
        kind: "rename";
    }>): Promise<Reply>;
    /** The reflective connect: one call joining two blocks/files. */
    connect(Operation: Extract<Operation, {
        kind: "connect";
    }>): Promise<Reply>;
    /** The reflective replace: one call replacing a block's span. */
    replace(Operation: Extract<Operation, {
        kind: "replace";
    }>): Promise<Reply>;
    /** The dispatch by the operation's kind (the single-call entry). */
    act(Operation: Operation): Promise<Reply>;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The workspace-reflect service (registered from apply). */
        workspaceReflect: WorkspaceReflect;
    }
}
