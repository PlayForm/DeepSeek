// Envelope - the ONE shape every conversation emission carries (the
// conversation spine's section 3.1): `{ SessionId, Seq, Turn, Step, At, Kind,
// Data }`.
//
//   * `SessionId` is the session id the folded records belong to (the
//     session header record's own id; empty when the log carried none);
//   * `Seq` and `At` are the sequence number and the time copied from the
//     source session-log record (0 when the record carried none - the
//     projection is pure, so it never reads a clock);
//   * `Turn` and `Step` are the turn and step the emission belongs to (the
//     event's own fields when it carries them, else the state's current
//     ones);
//   * `Kind` is the event name (Names, or a future event);
//   * `Data` is the event's own payload.
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
