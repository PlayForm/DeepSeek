// Service - the engine surface the UI package resolves through ctx.get("cost").
import type CostResponse from "./Response.js";

export default interface CostService {
	session(SessionId: string, Rows: number): CostResponse;
}
