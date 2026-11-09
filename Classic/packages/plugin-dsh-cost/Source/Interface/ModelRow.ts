// ModelRow - one CostModelRow per (provider, model) pair this session called
// (the MODELS view): the call count, the input, output and cache-read tokens
// the calls reported with their sum in `tokens`, and the money those calls
// allocated across every file they touched, direct plus amortized, rounded to
// six decimals. The pair is the grain because one conversation can mix
// models, and the ranking answers which model the conversation paid.
export default interface CostModelRow {
	provider: string;
	model: string;
	calls: number;
	tokens: number;
	input: number;
	output: number;
	cacheRead: number;
	total: number;
}
