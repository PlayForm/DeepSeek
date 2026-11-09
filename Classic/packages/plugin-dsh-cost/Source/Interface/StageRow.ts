// StageRow - one CostStageRow per stage this session's touches reached (the
// STAGES view): the stage name a touch carries (a touch with no stage reads
// "unclassified", never dropped), how many touches the session made in it,
// the tokens the calls carrying those touches reported (zero when the ledger
// stores none, because a token total per file does not exist in the ledger's
// grain), and the money those calls allocated to the touched files, direct
// plus amortized, rounded to six decimals.
export default interface CostStageRow {
	stage: string;
	touches: number;
	tokens: number;
	cost: number;
}
