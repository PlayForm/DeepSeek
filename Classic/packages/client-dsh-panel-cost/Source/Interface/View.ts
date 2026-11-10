import type { Translate } from "@Interface/Translate";

/**
 * @module View
 *
 * The prop bag the conversation.view slot hands the panel.
 *
 * @remarks
 *
 * The skeleton's sessionId prop is kept; `t` is the slot's translate resolver and `rows` is the row
 * budget the panel starts with before it grows older pages.
 */
export default interface ViewProps {
	/**
	 * The session the panel reads, absent when the slot named none.
	 */
	sessionId?: string;
	/**
	 * The slot's translate resolver, with the panel's own fallback when absent.
	 */
	t?: Translate;
	/**
	 * The row budget the panel starts with before it grows older pages.
	 */
	rows?: number;
}
