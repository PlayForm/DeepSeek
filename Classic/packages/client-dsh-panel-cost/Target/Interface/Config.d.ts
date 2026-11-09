export interface Config {
    /** Whether the Cost tab mounts at all. */
    enabled: boolean;
    /** The tab's order within the conversation.view slot. */
    tabOrder: number;
    /** The ledger row budget the host route reads per request. */
    rows: number;
    /** The dictionary the tab renders through. */
    locale: "en" | "zh";
}
