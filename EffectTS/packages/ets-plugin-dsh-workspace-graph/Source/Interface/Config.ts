// Configuration - the resolved plain shape the schema produces after the
// volatile cells are unwrapped (Interface/Configuration in the service
// API). Exactly the brief's section 4.5 frozen table; no hidden knobs.
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
