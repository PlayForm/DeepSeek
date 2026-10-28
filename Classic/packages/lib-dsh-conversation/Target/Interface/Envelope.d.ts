export default interface Envelope {
    /** The session id the folded records belong to (empty when the log carried none). */
    SessionId: string;
    /** The sequence number of the source session-log record. */
    Seq: number;
    /** The turn the emission belongs to. */
    Turn: number;
    /** The step the emission belongs to. */
    Step: number;
    /** The source record's time in epoch milliseconds (0 when it carried none). */
    At: number;
    /** The event name. */
    Kind: string;
    /** The event's own payload. */
    Data: unknown;
}
