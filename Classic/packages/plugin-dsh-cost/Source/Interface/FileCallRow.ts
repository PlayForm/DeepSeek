// FileCallRow - one CostFileCallRow per call of one conversation that
// allocated money to one file (the file-scoped call read, the second level of
// the file-to-conversation-to-call product surface): the call's identity in
// the conversation grain (`callId`, `turn`, `step`, `at`), the provider and
// model that priced it, the money its allocations to the file carried with
// their sum in `total`, the four token buckets the call reported, the stage
// the file reached in that call, and whether the call actually touched the
// file (`touched`) or only carried it in its context. The money rounds to six
// decimals, so a call row agrees with the conversation row above it and with
// the file row of the session reader; `stage` stays null when the call
// recorded no touch (the context-only case) or a touch the ledger left
// unclassified, and `touched` is the one evidence fact the caller renders a
// label from - a touched call paid the file's direct share, a carried call
// paid only the amortized context share.
export default interface CostFileCallRow {
	callId: number;
	turn: number;
	step: number;
	at: number;
	provider: string;
	model: string;
	direct: number;
	amortized: number;
	total: number;
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	stage: string | null;
	touched: boolean;
}
