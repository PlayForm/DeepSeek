export default interface Bridge {
    /** Write the namespace's whole resolved config; true when the editor accepted it. */
    editFull(namespace: string, patch: Record<string, unknown>): Promise<boolean>;
}
