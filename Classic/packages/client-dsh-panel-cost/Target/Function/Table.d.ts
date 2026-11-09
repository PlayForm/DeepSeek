import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
export declare const COLUMNS: readonly ["scope", "model", "files", "tokens", "cache", "cacheRead", "input", "output", "other", "allocation", "total"];
type TableProps = {
    Body: readonly ReturnType<typeof createElement>[];
    Totals: ReturnType<typeof createElement>;
    t: Translate;
};
export default function Table(Props: TableProps): ReturnType<typeof createElement>;
export {};
