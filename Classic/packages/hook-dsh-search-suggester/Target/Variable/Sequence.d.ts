export interface Call {
    /** The lane's agent id (one ring per lane). */
    agent: string;
    /** The tool name. */
    name: string;
    /** The tool arguments (the classifier reads pattern / file_path / command). */
    arguments: Record<string, unknown>;
    /** The lane's user message (the R12 context word), driven before the call. */
    context?: string;
}
declare const _default: {
    calls: Call[];
    expected: Record<string, string[]>;
};
export default _default;
