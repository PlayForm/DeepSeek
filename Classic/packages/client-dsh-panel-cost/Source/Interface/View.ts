// ViewProps - the prop bag the conversation.view slot hands the panel. The
// skeleton's sessionId prop is kept; t is the slot's translate resolver and
// rows is the row budget the panel starts with before it grows older pages.
import type { Translate } from "@Interface/Translate";

export default interface ViewProps {
	sessionId?: string;
	t?: Translate;
	rows?: number;
}
