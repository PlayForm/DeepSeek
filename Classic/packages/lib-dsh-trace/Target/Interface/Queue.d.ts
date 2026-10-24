export default interface Queue {
    /** Coalesce one key into its in-flight task; a second call while in flight is dropped. */
    Schedule(Key: string): void;
    /** The promise of every task currently in flight (a smoke awaits it instead of sleeping). */
    readonly Flush: Promise<void>;
    /** Stop future scheduling and drop the queue (in-flight tasks still settle). */
    Dispose(): void;
}
