import type { DatabaseSync } from "node:sqlite";
import type PricingService from "../Interface/PricingService.js";
import type CostResponse from "../Interface/Response.js";
import type ValuationSelection from "../Interface/ValuationSelection.js";
export default function Reader(Database: DatabaseSync, SessionId: string, Rows: number, Selection?: ValuationSelection, Pricing?: PricingService): CostResponse;
