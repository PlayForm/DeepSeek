/**
 * @module StageRow
 *
 * One stage's row in the Cost tab's stage ranking.
 *
 * @remarks
 *
 * The row carries the touches the session spent in that stage, the tokens the carrying calls
 * reported, and the money those calls allocated to the files they touched.
 */
export default interface CostStageRow {
    /**
     * The stage's word.
     */
    stage: string;
    /**
     * The touches the session spent in the stage.
     */
    touches: number;
    /**
     * The tokens the carrying calls reported.
     */
    tokens: number;
    /**
     * The money the calls allocated to the files they touched.
     */
    cost: number;
}
