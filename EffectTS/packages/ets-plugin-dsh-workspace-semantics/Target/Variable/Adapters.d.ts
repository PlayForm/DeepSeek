declare const _default: {
    json: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode.js").default[];
            references: import("../Interface/ReferenceNode.js").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span.js").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span.js").default[];
            certainty: "references";
        } | undefined;
    };
    yaml: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode.js").default[];
            references: import("../Interface/ReferenceNode.js").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span.js").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span.js").default[];
            certainty: "references";
        } | undefined;
    };
    markdown: {
        extensions: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode.js").default[];
            references: import("../Interface/ReferenceNode.js").default[];
            dependencies: never[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span.js").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span.js").default[];
            certainty: "references";
        } | undefined;
    };
    package: {
        extensions: never[];
        files: string[];
        scan(text: string, _path: string): {
            symbols: import("../Interface/SymbolNode.js").default[];
            references: import("../Interface/ReferenceNode.js").default[];
            dependencies: string[];
            certain: true;
        };
        rename(text: string, path: string, span: import("../Interface/Span.js").default, to: string): {
            path: string;
            from: string;
            to: string;
            edits: import("../Interface/Span.js").default[];
            certainty: "references";
        } | undefined;
    };
};
export default _default;
