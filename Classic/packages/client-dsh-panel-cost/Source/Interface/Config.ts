// Config - the validated shape of the Schemastery schema in Variable/Config:
// what the loader hands apply after boot-time validation. The volatile flags
// are dropped there; this interface carries the plain values.
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
