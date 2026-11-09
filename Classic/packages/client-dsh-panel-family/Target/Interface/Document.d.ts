/**
 * @module Document
 *
 * The minimal DOM surface the stylesheet mount needs (the build's base tsconfig targets ESNext with
 * node types only, so the browser globals are declared here instead of pulling in the full DOM
 * library).
 *
 * @remarks
 * The input member is an interface merge because `@types/react`'s global shim already declares the
 * empty `HTMLInputElement`; the field row reads its value on change.
 */
declare const document: {
    querySelector(selectors: string): unknown;
    createElement(tagName: string): {
        dataset: {
            plugin: string;
            pluginCss: string;
        };
        textContent: string;
    };
    head: {
        append(node: unknown): void;
    };
};
interface HTMLInputElement {
    value: string;
}
