/** The structural scope cells the arm reads (all optional: a hand-built
 *  config may omit the object entirely). */
type Scopes = {
    conversation?: boolean | undefined;
    reasoning?: boolean | undefined;
    toolInput?: boolean | undefined;
    toolResults?: boolean | undefined;
    files?: boolean | undefined;
    batch?: boolean | undefined;
};
/** The per-apply state cells the tool-results arm reads. */
type State = {
    Scopes?: Scopes | undefined;
    Exempt?: string[] | undefined;
};
/** The structural tool execution: only the fields the arm reads. */
type Execution = {
    name?: unknown;
    callId?: unknown;
};
/** The structural tool execution result: only the content basis. */
type Result = {
    content?: unknown;
};
/** The structural post-tool decision: the fields the arm reads/writes. */
type Decision = {
    kind?: unknown;
    content?: readonly unknown[];
    value?: unknown;
};
/** The injected ledger sink: the factory's Append/Journal, module-typed. */
type Ledger<S> = {
    Append: (State: S, Line: string) => void;
    Journal: (State: S, Event: string, Path: string, Value: string) => void;
};
export default _default;
declare function _default<S extends State, D extends Decision = Decision>(Transform: (Text: string, State: S) => {
    text: string;
    count: number;
}, Line: (Count: number, Name: string, CallID: string) => string, Ledger: Ledger<S>, Exempt: readonly string[]): (Exec: Execution, Result: Result, Next: () => Promise<D>, State: S) => Promise<D>;
