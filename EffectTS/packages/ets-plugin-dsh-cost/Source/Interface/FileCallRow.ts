// FileCallRow - one row per call of one conversation that allocated money to
// one file (the file-scoped call read, the second level of the
// file-to-conversation-to-call product surface): the call's identity in the
// conversation grain (`CallId`, `Turn`, `Step`, `At`), the provider and model
// that priced it, the money its allocations to the file carried with their
// sum in `Total`, the four token buckets the call reported, the stage the
// file reached in that call, and whether the call actually touched the file
// (`Touched`) or only carried it in its context. The money rounds to six
// decimals, so a call row agrees with the conversation row above it and with
// the file row of the report reads; `Stage` stays null when the call recorded
// no touch (the context-only case) or a touch the ledger left unclassified,
// and `Touched` is the one evidence fact the caller renders a label from - a
// touched call paid the file's direct share, a carried call paid only the
// amortized context share. The field names are the twin's PascalCase, the
// field set and the types are the Classic row's.
export default interface FileCallRow {
	readonly CallId: number;
	readonly Turn: number;
	readonly Step: number;
	readonly At: number;
	readonly Provider: string;
	readonly Model: string;
	readonly Direct: number;
	readonly Amortized: number;
	readonly Total: number;
	readonly Input: number;
	readonly Output: number;
	readonly CacheRead: number;
	readonly CacheWrite: number;
	readonly Stage: string | null;
	readonly Touched: boolean;
}
