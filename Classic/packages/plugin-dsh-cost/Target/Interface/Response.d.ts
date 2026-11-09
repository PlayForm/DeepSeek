import type CostCall from "./Call.js";
import type CostSession from "./Session.js";
import type CostSummary from "./Summary.js";
export default interface CostResponse {
    ok: boolean;
    code: "ok" | "session" | "unavailable" | "error";
    message: string | null;
    path: string;
    rows: number;
    truncated: boolean;
    session: CostSession | null;
    currency: string;
    currencies: readonly string[];
    summary: CostSummary;
    calls: readonly CostCall[];
}
