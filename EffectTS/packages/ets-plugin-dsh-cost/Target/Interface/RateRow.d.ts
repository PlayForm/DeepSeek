export default interface RateRow {
    readonly RateRowId: number;
    readonly RevisionId: number;
    readonly Provider: string;
    readonly Model: string;
    readonly Currency: string;
    readonly InputRate: number;
    readonly OutputRate: number;
    readonly CacheReadRate: number | null;
    readonly CacheWriteRate: number | null;
    readonly ReasoningRate: number | null;
    readonly ValidFrom: number;
    readonly ValidTo: number | null;
    readonly Mode: string;
    readonly Region: string | null;
    readonly Window: string;
    readonly TierFrom: number;
    readonly TierTo: number | null;
    readonly Note: string | null;
}
