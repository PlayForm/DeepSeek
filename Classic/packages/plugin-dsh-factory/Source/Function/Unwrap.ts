// Unwrap — the defensive Schemastery cell unwrap used by Function/State
// (Function/Apply in the trio). If a config field arrives as a Schemastery
// cell (`{ get }` — the loader's representation for VOLATILE fields; log,
// logFile, updateCooldownMs and mutationTools are volatile) it is unwrapped
// before the State is built; a failed unwrap keeps the raw value (the schema
// default). Byte-identical semantics with the trio's apply-time loop.
export default (Config: unknown): Record<string, unknown> => {
	const Plain: Record<string, unknown> = {
		...((Config as Record<string, unknown> | undefined) ?? {}),
	};
	for (const Key of Object.keys(Plain)) {
		const Value = Plain[Key] as { get?: () => unknown } | null | undefined;
		switch (true) {
			case Value !== null && typeof Value === "object" && typeof Value.get === "function":
				try {
					Plain[Key] = Value.get?.();
				} catch {
					/* keep the raw value */
				}
				break;
		}
	}
	return Plain;
};
