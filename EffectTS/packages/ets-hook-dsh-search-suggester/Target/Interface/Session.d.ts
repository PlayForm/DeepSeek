import type { Touch } from "@playform/ets-lib-dsh-pack";
export interface SessionHistory {
    /** The next touch's sequence number. */
    Seq: number;
    /** The folded touches, oldest first. */
    Touches: Touch[];
}
export interface SessionEvent {
    /** The event kind (`tool/call`, `tool/result`, `turn/start`, ...). */
    readonly type?: string;
    /** The committed log position. */
    readonly seq?: number;
    /** The event payload. */
    readonly data?: {
        readonly name?: unknown;
        readonly arguments?: unknown;
    };
}
export interface StateSchema<S> {
    parse(Value: unknown): S;
}
export interface ProjectionUnit<S> {
    /** The projection key this unit owns. */
    readonly key: string;
    /** Validates persisted state before it seeds a fold. */
    readonly stateSchema: StateSchema<S>;
    /** State for the empty log and its immutable Session metadata. */
    init(header: unknown, inheritedEventCount: unknown): S;
    /** Pure transition: previous state + one committed event -> next state. */
    apply(state: S, event: SessionEvent): S;
    /** Persisted-cache invalidation version. */
    readonly stateVersion: number;
}
export interface ProjectionRegistry {
    /** Install one unit on the calling context's fiber. */
    register(unit: ProjectionUnit<SessionHistory>): unknown;
    /** Read one unit's live read-only host state for one session. */
    stateOf(session: unknown, key: string): SessionHistory | undefined;
}
export interface ProjectionChild {
    readonly sessionProjections: ProjectionRegistry;
}
export interface InjectingContext {
    inject?(dependencies: string[], callback: (child: ProjectionChild) => unknown): unknown;
}
export interface ProbingContext {
    get?(name: string): unknown;
}
