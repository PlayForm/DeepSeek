// VersionRow - one CostVersionRow per content version of one file path (the
// engine's third file-scoped read; the research's section 3.C, where
// current-artifact attribution needs content lineage, and section 4, the
// file-observation contract whose before and after hashes this grain stores):
// a file's content chain and the touches bound to it, visible beside its
// cost. The row carries the version's own identity and content evidence - its
// id, the SHORT PREFIX of the SHA-256 content hash the drain measured (the
// first twelve hex characters, the git-style short form, so the row reads as
// a version label rather than a paragraph), the encoded byte length and the
// line count of that exact content, and the instant the ledger first observed
// it - and the touches bound to it: how many touch rows carry this version as
// their VersionId, the first and last of their times, the distinct kinds they
// recorded (read, write, edit, delete or search, sorted) and the distinct
// session count of the conversations that produced them.
//
// A VERSION WITH NO BOUND TOUCH is a row, not a missing row: the after
// version of a write is bound only when a later touch comes, so it answers a
// zero touch count, null first and last times and an empty kind list. `hash`,
// `bytes` and `lines` stay null when the ledger stored no value for them, and
// `observedAt` is the ledger's own clock for the observation, never a caller
// guess. Every field is read-only: the ledger is the only writer, and this
// row is the read that presents its chain.
export default interface CostVersionRow {
	versionId: number;
	hash: string | null;
	bytes: number | null;
	lines: number | null;
	observedAt: number;
	touches: number;
	firstAt: number | null;
	lastAt: number | null;
	kinds: readonly string[];
	sessions: number;
}
