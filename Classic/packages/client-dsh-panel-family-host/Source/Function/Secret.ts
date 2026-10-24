// Secret - the bridge's secret-namespace guard. A namespace declaring a
// `role("secret")` field must never accept a whole-config patch: the panel
// only ever holds the REDACTED value of such a field (the settings service
// strips it), so writing the patch back would overwrite the stored secret
// with the redaction marker. The guard walks the plugin's serialized
// Schemastery schema (the `{ uid, refs }` envelope or a bare node) and looks
// for `meta.role === "secret"` at ANY depth - a nested object field counts
// exactly like a top-level one. The client refuses the same write on the same
// rule (Function/Form.ts marks the namespace); this is the host's independent
// refusal, never a trust in the client.
const IsRecord = (Value: unknown): Value is Record<string, unknown> =>
	typeof Value === "object" && Value !== null && !Array.isArray(Value);

/** Walk one serialized node (objects, arrays, refs) for a secret meta. */
const Walk = (Value: unknown, Depth: number): boolean => {
	switch (true) {
		case Depth > 8:
			return false;
		case Array.isArray(Value):
			return Value.some((Child) => Walk(Child, Depth + 1));
		case !IsRecord(Value):
			return false;
		default: {
			const Meta = Value["meta"];
			switch (true) {
				case IsRecord(Meta) && Meta["role"] === "secret":
					return true;
				default:
					return Object.values(Value).some((Child) => Walk(Child, Depth + 1));
			}
		}
	}
};

/** Report whether a plugin's schema declares any `role("secret")` field. */
export default function Secret(Schema: unknown): boolean {
	const Serialized =
		typeof (Schema as { toJSON?: unknown } | null)?.toJSON === "function"
			? (Schema as { toJSON: () => unknown }).toJSON()
			: Schema;
	return Walk(Serialized, 0);
}
