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
