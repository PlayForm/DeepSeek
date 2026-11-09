// View - the placeholder panel component. A later lane replaces this with
// the Statistics-style cost table; the skeleton only proves the mount path:
// it renders the title and the loading line and fetches nothing, so an
// unwired ledger can never leave the tab spinning on a real request. The
// translate helper prefers the caller-supplied t (the locale service's
// resolver) and falls back to the English dictionary, so the placeholder
// still speaks before the dictionaries land.
import EN_DICTIONARY from "@Variable/Locale-en.json";
import { createElement } from "react";

const Translate = (t: ((key: string) => string) | undefined, key: string): string =>
	t === undefined ? ((EN_DICTIONARY as Record<string, string>)[key] ?? key) : t(key);

export default function View(props: {
	sessionId?: string;
	t?: (key: string) => string;
}): ReturnType<typeof createElement> {
	return createElement(
		"section",
		{ className: "playform-cost-panel", "data-session": props.sessionId ?? "" },
		createElement("h2", {}, Translate(props.t, "title")),
		createElement("p", {}, Translate(props.t, "loading")),
	);
}
