export default interface Configuration {
    enabled: boolean;
    domain: string;
    languages: ("typescript" | "javascript" | "markdown")[];
    include: string[];
    exclude: string[];
    maxFileBytes: number;
    maxNodesPerFile: number;
    /** The `indexWorkspace` walk bound: at most this many candidate files. */
    maxFiles: number;
    limitDefault: number;
    limitMaximum: number;
}
