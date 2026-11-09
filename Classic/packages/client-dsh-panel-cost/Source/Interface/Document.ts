// Document - the minimal browser surface the package needs (the build's base
// tsconfig targets ESNext with node types only, so the globals are declared
// here instead of pulling in the full DOM library). The document declaration
// is the central panel package's, kept identical so the two packages
// type-check against one browser surface; the element and observer
// declarations are this package's addition, because the Cost table observes
// its turn rows to scale the bars against the visible window.
declare const document: {
	querySelector(selectors: string): unknown;
	createElement(tagName: string): {
		dataset: { plugin: string; pluginCss: string };
		textContent: string;
	};
	head: { append(node: unknown): void };
};

declare type HTMLElement = {
	dataset: Record<string, string | undefined>;
};

declare type HTMLDivElement = HTMLElement & {
	scrollTop: number;
	scrollHeight: number;
	querySelectorAll(selectors: string): { forEach(callback: (element: HTMLElement) => void): void };
};

declare const HTMLElement: { new (): HTMLElement };

declare const IntersectionObserver: {
	new (
		callback: (
			entries: Array<{ isIntersecting: boolean; target: HTMLElement }>,
		) => void,
	): { observe(target: unknown): void; disconnect(): void };
};
