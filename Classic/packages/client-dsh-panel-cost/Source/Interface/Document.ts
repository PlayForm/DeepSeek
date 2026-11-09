// Document - the minimal browser surface the package needs (the build's base
// tsconfig targets ESNext with node types only, so the globals are declared
// here instead of pulling in the full DOM library). The document declaration
// is the central panel package's, kept identical so the two packages
// type-check against one browser surface. The element members are declared as
// interface merges because @types/react's global shim already declares the
// empty interfaces; the observer has no shim, so it is declared here. The
// Cost table observes its turn rows to scale the bars against the visible
// window.
declare const document: {
	querySelector(selectors: string): unknown;
	createElement(tagName: string): {
		dataset: { plugin: string; pluginCss: string };
		textContent: string;
	};
	head: { append(node: unknown): void };
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
	new (callback: (entries: Array<{ isIntersecting: boolean; target: HTMLElement }>) => void): {
		observe(target: unknown): void;
		disconnect(): void;
	};
};
