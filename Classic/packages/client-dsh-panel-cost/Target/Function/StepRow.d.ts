import type { TurnsCells } from "./Columns.js";
import type CostStep from "../Interface/Step.js";
import type { ResolvedTable } from "../Interface/Table.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type StepRowProps = {
    Step: CostStep;
    Expanded: boolean;
    Scale: number;
    OnToggle: () => void;
    Resolved: ResolvedTable<TurnsCells>;
    t: Translate;
};
export default function StepRow(Props: StepRowProps): ReturnType<typeof createElement>;
export {};
