// Client - the client-half context face (Interface/Client): the harness
// client SDK services (ctx.locale, ctx.slots) are not a resolvable dependency
// of this package, so the package declares the two members it uses as an
// INTERSECTION with cordis's own Context - never as a `declare module`
// augmentation. A module augmentation of the package root would shadow the
// re-exported `Context` (the root module re-exports it from its own
// `./context.ts`), dropping every cordis member; the intersection keeps the
// full Context (ctx.get, ctx.logger, ctx.effect, ctx.reflect) and adds only
// what the browser client provides. The signatures mirror the harness's
// slots documentation: a registration's `children` table declares the child
// slots its entry owns, its `inject` factory supplies the entry-private
// data, and the renderer hands the entry a `renderSlot` prop for each
// declared child.
import type { Context } from "@deepseek-ai/cordis";

/** The browser client context: cordis's Context plus the two client services. */
export type ClientContext = Context & {
	/** The client locale service: registers one namespace's dictionaries and
	 *  returns the disposer that removes them. */
	locale: {
		register(namespace: string, dictionaries: Record<string, unknown>): () => void;
	};
	/** The client slot service: mounts components into named slots. */
	slots: {
		/** Register a factory for one slot point; the factory runs when the
		 *  slot opens and returns the registration's disposer. */
		inject(slot: string, factory: () => unknown): () => void;
		/** Register one component into the slot (returns the disposer). The
		 *  `children` table declares the child slots this entry owns; the
		 *  `inject` factory supplies the entry-private data. */
		register(
			options: {
				name: string;
				id: string;
				order?: number;
				locale?: string;
				label?: () => string;
				children?: Record<string, { kind: string; scope: string }>;
				inject?: () => Record<string, unknown>;
			},
			component: (props?: Record<string, unknown>) => unknown,
		): () => void;
	};
};
