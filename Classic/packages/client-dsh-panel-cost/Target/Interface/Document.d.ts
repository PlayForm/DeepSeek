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
interface HTMLElement {
    dataset: Record<string, string | undefined>;
}
interface HTMLDivElement {
    scrollTop: number;
    scrollHeight: number;
    querySelectorAll(selectors: string): {
        forEach(callback: (element: HTMLElement) => void): void;
    };
}
declare const IntersectionObserver: {
    new (callback: (entries: Array<{
        isIntersecting: boolean;
        target: HTMLElement;
    }>) => void): {
        observe(target: unknown): void;
        disconnect(): void;
    };
};
