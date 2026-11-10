/**
 * @module Report
 *
 * The read queries: one SELECT per report scope over the ledger's
 * pre-aggregated views, plus the analytics reads - the lifetime, stage,
 * factor, edit-grain and coverage reads.
 *
 * @remarks
 * The reads follow `Documentation/Plans/COST-TRACK-PLUGIN.md` sections 3 and
 * 16. FileCost serves the file rows, ClientCost the client rows, SessionCost
 * joined through the Session and Project dimensions the project rows, and the
 * model rows are grouped from Allocation and Call per provider, model, mode and
 * region (section 17.1, the pricing dimensions on the Call row). The analytics
 * reads are Lifetime over the FileLifetime view (the cost of one file across
 * every session that ever touched it, section 10) and Stages grouped from Touch
 * (the semantic pipeline's stage spend, section 16.1). The factor read (section
 * 17.1) groups CallFactor joined to Factor: one row per (Key, Value) with the
 * call count and the summed call cost, so a classification factor is a slice,
 * not a schema change. The v4 edit-grain read (section 17.3) groups Edit
 * through Touch to File: one row per file with the lines added and removed, the
 * hunk count and the summed cost. Each returns plain rows whose cost columns
 * are rounded to six decimals, so a report, an export and a re-derivation land
 * the same numbers at the same precision. The coverage read (research section
 * 2.2) groups Call by session and states the priced and unpriced call counts
 * with the tokens the unpriced calls spent, because a session whose calls have
 * no rate card carries zero money and must be reported as unpriced rather than
 * free. The FileCost view carries no token column, so file rows report Tokens
 * zero.
 */
import type { DatabaseSync } from "node:sqlite";
type Row = {
    Scope: "file" | "project" | "client" | "model" | "session";
    Key: string;
    Direct: number;
    Amortized: number;
    Total: number;
    Calls: number;
    Tokens: number;
};
type LifetimeRow = {
    Path: string;
    Sessions: number;
    Direct: number;
    Amortized: number;
    Cost: number;
};
type StageRow = {
    Stage: string;
    Touches: number;
    Tokens: number;
    Cost: number;
};
type FactorRow = {
    Key: string;
    Value: string;
    Calls: number;
    Cost: number;
};
type EditRow = {
    Path: string;
    LinesAdded: number;
    LinesRemoved: number;
    Hunks: number;
    Cost: number;
};
type CoverageRow = {
    SessionId: string;
    Calls: number;
    Priced: number;
    Unpriced: number;
    UnpricedTokens: number;
};
declare const Row: (Scope: Row["Scope"], Raw: Record<string, unknown>) => Row;
export default _default;
declare function _default(Database: DatabaseSync): {
    File: (Path?: string) => readonly Row[];
    Project: (Root?: string) => readonly Row[];
    Client: (Name?: string) => readonly Row[];
    Model: () => readonly Row[];
    Session: (Id?: string) => readonly Row[];
    Lifetime: (Path?: string) => readonly LifetimeRow[];
    Stages: (Path?: string) => readonly StageRow[];
    Factors: () => readonly FactorRow[];
    Edits: (Path?: string) => readonly EditRow[];
    Coverage: (SessionId?: string) => readonly CoverageRow[];
};
