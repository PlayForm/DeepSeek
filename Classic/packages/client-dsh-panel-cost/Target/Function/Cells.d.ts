import type CostBuckets from "../Interface/Buckets.js";
import type { Translate } from "../Interface/Translate.js";
import { createElement } from "react";
type Marker = {
    Class: string;
    Text: string;
    Title?: string;
};
type ScopeCellProps = {
    Cell: string;
    Toggle?: {
        Expanded: boolean;
        Label: string;
        Aria: string;
        Title: string;
        OnToggle: () => void;
    };
    Label?: string;
    Clock?: {
        Text: string;
        Title: string;
    };
    Hint?: string;
    Markers: readonly Marker[];
};
type ModelCellProps = {
    Cell: string;
    Provider: string;
    Model: string;
    Mode?: string;
    Region?: string;
    Tier?: number | null;
    When?: {
        Text: string;
    };
    Title?: string;
};
type FilePill = {
    Name: string;
    Tone: number;
    Count: number;
    Lines: number | null;
};
type FilesCellProps = {
    Cell: string;
    Pills: readonly FilePill[];
    Fail: boolean;
    Saving: number;
    Calls: number;
    Tokens: number;
    Currency: string;
    ShowMix: boolean;
    t: Translate;
};
type MoneyCellProps = {
    Cell: string;
    Value: number;
    Currency: string;
    Title?: string;
};
type AllocCellProps = {
    Cell: string;
    Direct: number;
    Amortized: number;
    Has: boolean;
    Currency: string;
    t: Translate;
};
type BarCellProps = {
    Cell: string;
    Track: string;
    Total: number;
    Cost: CostBuckets;
    Scale: number;
    Currency: string;
    Start: number | null;
    t: Translate;
};
declare const Scope: (Props: ScopeCellProps) => ReturnType<typeof createElement>;
declare const Model: (Props: ModelCellProps) => ReturnType<typeof createElement>;
declare const Files: (Props: FilesCellProps) => ReturnType<typeof createElement>;
declare const Money: (Props: MoneyCellProps) => ReturnType<typeof createElement>;
declare const Alloc: (Props: AllocCellProps) => ReturnType<typeof createElement>;
declare const Bar: (Props: BarCellProps) => ReturnType<typeof createElement>;
declare const _default: {
    readonly Scope: typeof Scope;
    readonly Model: typeof Model;
    readonly Files: typeof Files;
    readonly Money: typeof Money;
    readonly Bar: typeof Bar;
    readonly Alloc: typeof Alloc;
};
export default _default;
