export default interface FileCallRow {
    readonly CallId: number;
    readonly Turn: number;
    readonly Step: number;
    readonly At: number;
    readonly Provider: string;
    readonly Model: string;
    readonly Direct: number;
    readonly Amortized: number;
    readonly Total: number;
    readonly Input: number;
    readonly Output: number;
    readonly CacheRead: number;
    readonly CacheWrite: number;
    readonly Stage: string | null;
    readonly Touched: boolean;
}
