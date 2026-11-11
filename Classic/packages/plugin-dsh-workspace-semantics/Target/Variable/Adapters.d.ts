/**
 * @module Adapters
 *
 * The any-file adapter CATALOG: one constant built once at load.
 *
 * @remarks
 *
 * The names are the config `adapters` vocabulary; each entry is the adapter
 * module (Function/JSON, Function/Yaml, Function/Markdown, Function/Package).
 * The TypeScript adapter is NOT in the catalog: it is the default registration
 * and always registers first.
 *
 * The catalog is the load-time validation source too: a config naming an
 * unknown adapter fails LOUD at load with the catalog in the message, never a
 * silent skip.
 */
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
