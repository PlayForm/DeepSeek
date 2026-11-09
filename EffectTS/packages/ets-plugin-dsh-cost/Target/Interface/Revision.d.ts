export default interface Revision {
    readonly RevisionId: number;
    readonly CatalogId: number;
    readonly ParentRevisionId: number | null;
    readonly CreatedAt: number;
    readonly Reason: string;
    readonly Status: "draft" | "published";
}
