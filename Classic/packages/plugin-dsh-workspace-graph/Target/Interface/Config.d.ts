export default interface Configuration {
    enabled: boolean;
    domain: string;
    languages: ("typescript" | "javascript" | "markdown")[];
    include: string[];
    exclude: string[];
    maxFileBytes: number;
    maxNodesPerFile: number;
    limitDefault: number;
    limitMaximum: number;
}
