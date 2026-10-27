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
};
