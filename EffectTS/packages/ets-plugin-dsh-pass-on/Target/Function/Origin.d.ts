export default _default;
/**
 * @module Origin
 *
 * The proposal's return address: the agent whose inbox carries the proposal
 * and to whose inbox the decision returns.
 *
 * @remarks
 *
 * 1. The caller's explicit origin (the tool/subagent that asked for the batch)
 *    wins.
 * 2. Otherwise the harness's INITIATOR - the exact agent whose driver chain
 *    called us (packages/core/agent/src/index.ts:297
 *    `AgentRegistry.currentInitiator`).
 * 3. Otherwise "" - no return address, and the delivery records `inbox none`
 *    honestly (the bus emission still carries the proposal).
 *
 * The probe is at use time (the family's optional-service rule): a context
 * without an agent registry (a cold harness, a smoke) yields "".
 */
declare function _default(Context: unknown, Given?: string): string;
