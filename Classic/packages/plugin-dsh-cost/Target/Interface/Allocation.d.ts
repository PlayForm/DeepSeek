export default interface Allocation {
    readonly CallId: number | null;
    readonly Path: string | null;
    readonly DirectCost: number;
    readonly AmortizedCost: number;
    readonly ContextTokens: number;
    readonly SurfaceTokens: number;
    readonly Weight: number;
    readonly Method: string;
}
