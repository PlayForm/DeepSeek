export default interface PricingPreview {
    readonly SessionId: string;
    readonly Calls: number;
    readonly Priced: number;
    readonly Unpriced: number;
    readonly Current: number;
    readonly Revised: number;
    readonly Difference: number;
    readonly Currency: string;
}
