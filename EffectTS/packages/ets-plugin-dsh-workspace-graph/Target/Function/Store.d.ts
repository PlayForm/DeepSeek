import type State from "@Interface/State.js";
declare const _default: {
    put(StateRef: State, Key: string, Value: unknown): Promise<void>;
    remove(StateRef: State, Key: string): Promise<boolean>;
    entries(StateRef: State): [string, unknown][];
    meta(StateRef: State): {
        indexRevision?: number | undefined;
    } | undefined;
    putMeta(StateRef: State, Revision: number): Promise<void>;
};
export default _default;
