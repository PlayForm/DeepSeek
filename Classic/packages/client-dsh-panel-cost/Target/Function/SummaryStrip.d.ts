import type { Valuation as CostValuation } from "../Interface/Response.js";
import type CostSummary from "../Interface/Summary.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type SummaryStripProps = {
    Summary: CostSummary;
    Valuation: CostValuation | null;
    Turns: number;
    Steps: number;
    AllOpen: boolean;
    AnyTurn: boolean;
    OnToggleAll: () => void;
    OnOpenFile: (Path: string) => void;
    t: Translate;
};
export default function SummaryStrip(Props: SummaryStripProps): ReturnType<typeof createElement>;
export {};
