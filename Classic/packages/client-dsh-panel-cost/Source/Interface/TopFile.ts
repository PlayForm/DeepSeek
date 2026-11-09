// TopFile - one entry of the summary's top files (Design.md section 9.8):
// the file's allocated money for the session and the number of the
// session's calls that allocated it, ordered descending by total then
// ascending by path.
export default interface CostTopFile {
	path: string;
	direct: number;
	amortized: number;
	total: number;
	calls: number;
}
