export default interface Price {
    readonly Provider: string;
    readonly Model: string;
    readonly Currency: string;
    readonly InputRate: number;
    readonly OutputRate: number;
    readonly CacheReadRate: number | null;
    readonly CacheWriteRate: number | null;
    readonly ReasoningRate: number | null;
    readonly EffectiveFrom: number;
    readonly TierFrom: number;
    readonly TierTo: number | null;
    readonly Mode: string;
    readonly Region: string | null;
}
