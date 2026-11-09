// Session - the resolved session row (Design.md section 9.3): the Session
// table's own columns joined through Project and Client, with every
// nullable column carried as null when the ledger stores no value.
export default interface CostSession {
	id: string;
	project: string | null;
	root: string | null;
	client: string | null;
	title: string | null;
	cwd: string | null;
	origin: string | null;
	agentPreset: string | null;
	parentSessionId: string | null;
	delegationDepth: number | null;
	createdAt: number;
	endedAt: number | null;
}
