/**
 * @module ModelRow
 *
 * One CostModelRow per (provider, model) pair this session called: the call
 * count, the tokens the calls reported and the money their allocations
 * carried.
 *
 * @remarks
 *
 * The row is the MODELS view. The money is direct plus amortized across every
 * file the calls touched, rounded to six decimals. The pair is the grain
 * because one conversation can mix models, and the ranking answers which model
 * the conversation paid.
 */
export default interface CostModelRow {
    /**
     * The provider the calls ran against.
     */
    provider: string;
    /**
     * The model the calls ran with.
     */
    model: string;
    /**
     * The count of calls this session made with the pair.
     */
    calls: number;
    /**
     * The input, output and cache-read tokens summed.
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
     * The money the calls' allocations carried, rounded to six decimals.
     */
    total: number;
}
