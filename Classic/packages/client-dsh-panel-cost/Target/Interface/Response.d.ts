import type CostCall from "./Call.js";
import type CostFileRow from "./FileRow.js";
import type CostModelRow from "./ModelRow.js";
import type CostSession from "./Session.js";
import type CostStageRow from "./StageRow.js";
import type CostSummary from "./Summary.js";
export interface Valuation {
    basis: "as-recorded" | "corrected" | "current" | "scenario";
    revisionId: number;
    policyVersion: string;
    calculatedAt: number;
    recorded: number;
    revised: number;
    difference: number;
}
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
    files: readonly CostFileRow[] | null;
    stages: readonly CostStageRow[] | null;
    models: readonly CostModelRow[] | null;
    valuation?: Valuation;
}
