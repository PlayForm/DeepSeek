import type CostSummary from "../Interface/Summary.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type SummaryStripProps = {
    Summary: CostSummary;
    Turns: number;
    Steps: number;
    AllOpen: boolean;
    AnyTurn: boolean;
    OnToggleAll: () => void;
    t: Translate;
};
export default function SummaryStrip(Props: SummaryStripProps): ReturnType<typeof createElement>;
export {};
