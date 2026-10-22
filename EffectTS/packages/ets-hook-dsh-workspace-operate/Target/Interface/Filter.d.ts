export default interface Filter {
    kind?: "rename" | "connect" | "replace";
    path?: string;
    status?: "proposed" | "withdrawn";
    limit?: number;
}
