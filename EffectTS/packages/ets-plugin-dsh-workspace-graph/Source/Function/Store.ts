// Store - the KV facet through the storage domain (the brief's section 4.4,
// the factory's Function/Open pattern): one record per path keyed by the
// resolved display path, plus one meta record keyed `__meta` carrying
// `{ indexRevision }` in the same `records` table. Best-effort and honest:
// when no domain handle is open every writer is a no-op and the readers fall
// back to the in-memory mirror (which the open loads from the store). The
// __meta key is skipped by the readers so the meta record is never mistaken
// for a file record.
import type State from "@Interface/State.js";

export default {
	async put(StateRef: State, Key: string, Value: unknown): Promise<void> {
		await StateRef.Domain?.table("records").put(Key, Value);
	},
	async remove(StateRef: State, Key: string): Promise<boolean> {
		return (await StateRef.Domain?.table("records").delete(Key)) === true;
	},
	entries(StateRef: State): [string, unknown][] {
		return StateRef.Domain === undefined
			? []
			: Array.from(StateRef.Domain.table("records").entries());
	},
	meta(StateRef: State): { indexRevision?: number | undefined } | undefined {
		const Value = StateRef.Domain?.table("records").get("__meta") as
			{ indexRevision?: unknown } | undefined;
		return Value === undefined
			? undefined
			: {
					indexRevision:
						typeof Value["indexRevision"] === "number"
							? Value["indexRevision"]
							: undefined,
				};
	},
	async putMeta(StateRef: State, Revision: number): Promise<void> {
		await StateRef.Domain?.table("records").put("__meta", { indexRevision: Revision });
	},
};
