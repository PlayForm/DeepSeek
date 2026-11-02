import type { ConfirmReply, ParseResult, PlanReply } from "../Interface/Reply.js";
export default _default;
declare function _default(Reply: string, Phase: 1 | 2, MaxOperations: number): ParseResult<PlanReply | ConfirmReply>;
