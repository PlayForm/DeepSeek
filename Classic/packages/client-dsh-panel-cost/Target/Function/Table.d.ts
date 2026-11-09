import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type TableProps = {
    Body: readonly ReturnType<typeof createElement>[];
    Totals: ReturnType<typeof createElement>;
    t: Translate;
};
export default function Table(Props: TableProps): ReturnType<typeof createElement>;
export {};
