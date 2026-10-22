// FactoryHandle - the slice of the factory service the context service
// consumes (the structural consumer precedent of the observe/monitor hooks).
// The service holds the injected `pluginFactory` instance and uses: the
// State builder, the ledger, and the exclusion match (unused by the packet
// but part of the shared shape).
export default interface FactoryHandle {
	/** The State builder: cell unwrap + shared fields + module extras. */
	State(Context: unknown, Config: unknown, Setup: unknown): unknown;
	/** The ledger: logger first, then the durable file; never throws. */
	Append(State: unknown, Message: string): void;
	/** The exclusion match (the factory's segment match). */
	Match(Path: string, List: string[] | null | undefined): boolean;
	/** The fs/observed registration on the ROOT context (unused by the
	 *  service role; part of the shared handle shape). */
	Wire(Context: unknown, State: unknown, Observe: unknown): void;
}
