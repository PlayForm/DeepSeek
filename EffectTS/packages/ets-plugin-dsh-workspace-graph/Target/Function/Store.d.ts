import type State from "../Interface/State.js";
/**
 * @module Store
 *
 * The KV facet through the storage domain, per the brief's section 4.4 and
 * the factory's Function/Open pattern.
 *
 * @remarks
 *
 * One record per path keyed by the resolved display path, plus one meta
 * record keyed `__meta` carrying `{ indexRevision }` in the same `records`
 * table. Best-effort and honest: when no domain handle is open every writer
 * is a no-op and the readers fall back to the in-memory mirror (which the
 * open loads from the store). The __meta key is skipped by the readers so the
 * meta record is never mistaken for a file record.
 */
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
