// StageRow - one stage's row in the Cost tab's stage ranking: the touches
// the session spent in that stage, the tokens the carrying calls reported,
// and the money those calls allocated to the files they touched.
export default interface CostStageRow {
	stage: string;
	touches: number;
	tokens: number;
	cost: number;
}
