export type PanelBridge = {
    /** Write the namespace's whole plain config; true when the host accepted it. */
    editFull: (namespace: string, patch: Record<string, unknown>) => Promise<boolean>;
};
