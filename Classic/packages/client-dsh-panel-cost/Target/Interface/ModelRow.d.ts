/**
 * @module ModelRow
 *
 * One model's row in the Cost tab's model ranking.
 *
 * @remarks
 *
 * The row carries the calls the session made on that provider/model, the token buckets they
 * reported, and the money those calls cost.
 */
export default interface CostModelRow {
    /**
     * The provider's id.
     */
    provider: string;
    /**
     * The model's id.
     */
    model: string;
    /**
     * How many calls the session made on the model.
     */
    calls: number;
    /**
     * The total tokens the calls reported.
     */
    tokens: number;
    /**
     * The input tokens the calls reported.
     */
    input: number;
    /**
     * The output tokens the calls reported.
     */
    output: number;
    /**
     * The cache-read tokens the calls reported.
     */
    cacheRead: number;
    /**
     * The money the calls cost.
     */
    total: number;
}
