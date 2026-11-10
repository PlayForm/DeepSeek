/**
 * @module Document
 *
 * Declares the minimal DOM surface the stylesheet mount needs.
 *
 * @remarks
 * The build's base tsconfig targets ESNext with node types only, so the
 * browser globals are declared here instead of pulling in the full DOM
 * library.
 */
declare const document: {
    /**
     * The selector lookup (whether a style is already mounted).
     */
    querySelector(selectors: string): unknown;
    /**
     * The element builder (the style element).
     */
    createElement(tagName: string): {
        dataset: {
            plugin: string;
            pluginCss: string;
        };
        textContent: string;
    };
    /**
     * The append target.
     */
    head: {
        append(node: unknown): void;
    };
};
