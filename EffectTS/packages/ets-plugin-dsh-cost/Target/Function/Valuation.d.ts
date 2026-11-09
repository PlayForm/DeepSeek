import type { DatabaseSync } from "node:sqlite";
import type PricingService from "@Interface/PricingService.js";
import type ValuationBlock from "@Interface/ValuationBlock.js";
import type ValuationSelection from "@Interface/ValuationSelection.js";
export default _default;
declare function _default(Database: DatabaseSync, Pricing?: PricingService): {
    Block: (SessionId: string, Selection?: ValuationSelection) => ValuationBlock | undefined;
};
