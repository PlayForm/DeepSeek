import type { Valuation as CostValuation } from "../Interface/Response.js";
import type CostSummary from "../Interface/Summary.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type OverviewPageProps = {
    Summary: CostSummary;
    Valuation: CostValuation | null;
    Turns: number;
    Steps: number;
    OnOpenFile: (Path: string) => void;
    t: Translate;
};
export default _default;
declare function _default(Props: OverviewPageProps): ReturnType<typeof createElement>;
