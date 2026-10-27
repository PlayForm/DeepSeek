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
declare const Row: (Scope: Row["Scope"], Raw: Record<string, unknown>) => Row;
export default _default;
declare function _default(Database: DatabaseSync): {
    File: (Path?: string) => readonly Row[];
    Project: (Root?: string) => readonly Row[];
    Client: (Name?: string) => readonly Row[];
    Model: () => readonly Row[];
    Session: (Id?: string) => readonly Row[];
};
