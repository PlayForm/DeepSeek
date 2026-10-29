// Form - the config-form contract: the settings view the panel reads from
// `ctx.configForms` (provided by @deepseek-ai/dsh-client-ui-settings), the
// form snapshot it renders, and the field view derived from the plugin's
// serialized Schemastery schema. The panel declares this shape locally (the
// client bundle must not import the settings package at runtime) and uses it
// structurally: a host that composes the settings client supplies the same
// methods.

// One path-addressed write (the settings service's SettingsPathOpView): `set`
// writes the value at the path, `unset` removes it.
export type PanelPathOperation =
	{ op: "set"; path: string[]; value: unknown } | { op: "unset"; path: string[] };

// One namespace view from settings.describe: the serialized schema envelope,
// the resolved value, the composition base, the raw user layer (a field's
// PRESENCE marks it overridden), and the revision fencing the next write.
export type PanelNamespaceView = {
	ns: string;
	schema: unknown;
	value: unknown;
	base?: unknown;
	user?: unknown;
	revision: number;
	applies?: "live";
	secrets?: readonly unknown[];
};

// The describe answer the form derives from.
export type PanelDescribeView = {
	namespaces: readonly PanelNamespaceView[];
	writable: boolean;
	hasDocument?: boolean;
};

// One namespace's shared form: current values and the revision-fenced write
// queue (the ui-settings ConfigForm face).
export type PanelConfigForm = {
	getSnapshot: () => {
		status: "loading" | "ready" | "unavailable";
		value?: unknown;
		base?: unknown;
		user?: unknown;
		revision?: number;
		writable: boolean;
	};
	subscribe: (listener: () => void) => () => void;
	set: (field: string, value: unknown) => Promise<boolean>;
	unset: (field: string) => Promise<boolean>;
	mutate: (
		operations: readonly PanelPathOperation[],
		expectedRevision?: number,
	) => Promise<boolean>;
};

// The shared describe face: the one Host settings mirror every form derives
// from.
export type PanelConfigDescribe = {
	getSnapshot: () => {
		status: "idle" | "loading" | "ready";
		view?: PanelDescribeView;
		error: string | null;
	};
	subscribe: (listener: () => void) => () => void;
	ensure: () => Promise<void>;
};

// The settings client service (`ctx.configForms`), resolved optionally.
export type PanelConfigForms = {
	get: (namespace: string) => PanelConfigForm;
	describe: () => PanelConfigDescribe;
};

// One field of the generated config form. `volatile` fields write through the
// revision-fenced settings mutate (applies live); plain fields write through
// the plain-field bridge (applies on remount); `secret` fields never expose
// their value.
export type PanelFormField = {
	path: string[];
	label: string;
	type: string;
	volatile: boolean;
	secret: boolean;
	overridden: boolean;
	value: unknown;
	base: unknown;
	options?: readonly string[];
};

// The rendered form view for one adapter section. `secret` marks a namespace
// whose schema declares at least one secret field: the plain-field bridge
// refuses such a namespace (the panel cannot restate a redacted value in the
// whole-config patch), so its plain fields render read-only.
export type PanelFormView = {
	namespace: string;
	status: "loading" | "ready" | "unavailable";
	writable: boolean;
	bridge: boolean;
	secret: boolean;
	revision?: number;
	fields: PanelFormField[];
};

// What Form() derives the view from: the namespace view (undefined until the
// describe mirror answers), the document writability, whether the settings
// client is composed at all, and whether the plain-field bridge is exposed.
export type PanelFormInput = {
	view?: PanelNamespaceView;
	writable: boolean;
	available: boolean;
	bridge: boolean;
};
