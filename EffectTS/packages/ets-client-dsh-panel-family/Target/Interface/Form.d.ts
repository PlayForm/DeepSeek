export type PanelPathOperation = {
    op: "set";
    path: string[];
    value: unknown;
} | {
    op: "unset";
    path: string[];
};
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
export type PanelDescribeView = {
    namespaces: readonly PanelNamespaceView[];
    writable: boolean;
    hasDocument?: boolean;
};
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
    mutate: (operations: readonly PanelPathOperation[], expectedRevision?: number) => Promise<boolean>;
};
export type PanelConfigDescribe = {
    getSnapshot: () => {
        status: "idle" | "loading" | "ready";
        view?: PanelDescribeView;
        error: string | null;
    };
    subscribe: (listener: () => void) => () => void;
    ensure: () => Promise<void>;
};
export type PanelConfigForms = {
    get: (namespace: string) => PanelConfigForm;
    describe: () => PanelConfigDescribe;
};
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
export type PanelFormView = {
    namespace: string;
    status: "loading" | "ready" | "unavailable";
    writable: boolean;
    bridge: boolean;
    secret: boolean;
    revision?: number;
    fields: PanelFormField[];
};
export type PanelFormInput = {
    view?: PanelNamespaceView;
    writable: boolean;
    available: boolean;
    bridge: boolean;
};
