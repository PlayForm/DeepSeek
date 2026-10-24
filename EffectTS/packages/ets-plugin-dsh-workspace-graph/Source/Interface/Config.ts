// Configuration - the resolved plain shape the schema produces after the
// volatile cells are unwrapped (Interface/Configuration in the service
// API). The brief's section 4.5 frozen table plus ONE field the indexing
// trigger needs (maxFiles - the workspace walk's bound, section 4.3's
// `indexWorkspace`); no other hidden knobs.
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
