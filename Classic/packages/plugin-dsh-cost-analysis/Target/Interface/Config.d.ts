export default interface Config {
    readonly enabled: boolean;
    readonly databasePath: string;
    readonly client: string;
    readonly window: number;
    readonly metrics: Metrics;
    readonly log: boolean;
    readonly logFile: string;
}
interface Metrics {
    readonly credit: boolean;
    readonly effectiveness: boolean;
    readonly lines: boolean;
    readonly overhead: boolean;
    readonly cache: boolean;
}
export {};
