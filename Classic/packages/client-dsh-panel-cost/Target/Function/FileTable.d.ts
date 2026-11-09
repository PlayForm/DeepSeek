import type CostFileRow from "../Interface/FileRow.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type FileTableProps = {
    Files: readonly CostFileRow[];
    Currency: string;
    t: Translate;
};
export default function FileTable(Props: FileTableProps): ReturnType<typeof createElement>;
export {};
