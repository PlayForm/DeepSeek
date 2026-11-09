import type CostCall from "@Interface/Call.js";
import type CostFileRow from "@Interface/FileRow.js";
import type CostModelRow from "@Interface/ModelRow.js";
import type CostSession from "@Interface/Session.js";
import type CostStageRow from "@Interface/StageRow.js";
import type CostSummary from "@Interface/Summary.js";
import type CostTokens from "@Interface/Tokens.js";
import type { ValuationBasis } from "@Interface/ValuationSelection.js";
interface Coverage {
    calls: number;
    priced: number;
    unpriced: number;
    unpricedTokens: CostTokens;
}
export interface Valuation {
    basis: ValuationBasis;
    revisionId: number;
    policyVersion: string;
    calculatedAt: number;
    recorded: number;
    revised: number;
    difference: number;
    unpriced: number;
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
    coverage: Coverage;
    calls: readonly CostCall[];
    files: readonly CostFileRow[] | null;
    stages: readonly CostStageRow[] | null;
    models: readonly CostModelRow[] | null;
    valuation?: Valuation;
}
export {};
