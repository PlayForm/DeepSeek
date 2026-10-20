/** The structural scope cells the arms read (all optional: a hand-built
 *  config may omit the object entirely). */
type Scopes = {
    conversation?: boolean | undefined;
    reasoning?: boolean | undefined;
    toolInput?: boolean | undefined;
    toolResults?: boolean | undefined;
    files?: boolean | undefined;
    batch?: boolean | undefined;
};
/** The per-apply state cells the step-batch arm reads. */
type State = {
    Scopes?: Scopes | undefined;
    Overpass?: boolean | undefined;
};
/** The structural pre-step payload: only the fields the arm reads. */
type Payload = {
    turn?: unknown;
    step?: unknown;
};
/** The structural pre-step decision: the arm only reads `kind`/`messages`. */
type Decision = {
    kind?: unknown;
    messages?: readonly unknown[];
};
/** The injected ledger sink: the factory's Append/Journal, module-typed. */
type Ledger<S> = {
    Append: (State: S, Line: string) => void;
    Journal: (State: S, Event: string, Path: string, Value: string) => void;
};
export default _default;
declare function _default<S extends State, P extends Payload = Payload, D extends Decision = Decision>(Transform: (Text: string, State: S) => {
    text: string;
    count: number;
}, Line: (Count: number, Turn: number, Step: number) => string, Ledger: Ledger<S>): (P: P, Next: () => Promise<D>, State: S) => Promise<D>;
