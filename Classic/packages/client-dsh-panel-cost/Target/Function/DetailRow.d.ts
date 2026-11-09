import type CostStep from "../Interface/Step.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type DetailRowProps = {
    Step: CostStep;
    t: Translate;
};
export default function DetailRow(Props: DetailRowProps): ReturnType<typeof createElement>;
export {};
