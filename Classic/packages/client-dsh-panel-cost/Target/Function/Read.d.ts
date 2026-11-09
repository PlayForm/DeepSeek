import type { DatabaseSync } from "node:sqlite";
import type CostResponse from "../Interface/Response.js";
export default function Read(Database: DatabaseSync, SessionId: string, Rows: number): CostResponse;
