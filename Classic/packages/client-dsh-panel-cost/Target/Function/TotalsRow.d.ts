import type CostSummary from "../Interface/Summary.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type TotalsRowProps = {
    Summary: CostSummary;
    t: Translate;
};
export default function TotalsRow(Props: TotalsRowProps): ReturnType<typeof createElement>;
export {};
