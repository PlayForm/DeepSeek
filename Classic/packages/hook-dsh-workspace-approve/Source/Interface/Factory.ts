/**
 * @module Factory
 *
 * The slice of the factory service the hook consumes.
 *
 * @remarks
 *
 * The hook holds the injected `pluginFactory` instance and uses: the State
 * builder (`Function/State` - cell unwrap plus shared fields plus the P10
 * volatile refresh), the ledger (`Function/Append` - logger plus
 * appendFileSync, never throws), and the Wire registration (the exact
 * `Context.root.on("fs/observed", ...)` posture). Structural, so the smoke can
 * serve the REAL built factory and any future refactor keeps the consumer
 * honest.
 */
export default interface FactoryHandle {
	/**
	 * The State builder: cell unwrap plus shared fields plus module extras.
	 */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;

	/**
	 * The ledger: logger first, then the durable file; never throws.
	 */
	Append(State: unknown, Message: string): void;

	/**
	 * The fs/observed registration on the ROOT context.
	 */
	Wire(Context: unknown, State: unknown, Observe: unknown): void;
}
