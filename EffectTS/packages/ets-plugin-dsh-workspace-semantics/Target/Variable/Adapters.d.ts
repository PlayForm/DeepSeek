declare const _default: {
    json: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode").default[];
            references: import("../Interface/ReferenceNode").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span").default[];
            certainty: "references";
        } | undefined;
    };
    yaml: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode").default[];
            references: import("../Interface/ReferenceNode").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span").default[];
            certainty: "references";
        } | undefined;
    };
    markdown: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode").default[];
            references: import("../Interface/ReferenceNode").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span").default[];
            certainty: "references";
        } | undefined;
    };
    package: {
        extensions: never[];
        files: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode").default[];
            references: import("../Interface/ReferenceNode").default[];
            dependencies: string[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span").default[];
            certainty: "references";
        } | undefined;
    };
};
export default _default;
