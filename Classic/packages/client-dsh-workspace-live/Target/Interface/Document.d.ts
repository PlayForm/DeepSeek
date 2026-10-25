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
