export default interface Rule {
    readonly Provider: string;
    readonly Model: string | null;
    readonly Kind: string;
    readonly Multiplier: number;
    readonly EffectiveFrom: number;
    readonly EffectiveTo: number | null;
}
