// ModelRow - one model's row in the Cost tab's model ranking: the calls the
// session made on that provider/model, the token buckets they reported, and
// the money those calls cost.
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
