// Decode — parse a JSON string, null on any failure or on non-object JSON.
// Error-contained — an unreadable or non-JSON package.json maps to null
// instead of a throw (the caller logs the "observed non-JSON" line). Pure
// internal calculation — part of the standing exemptions.
export default (Text: unknown): Record<string, unknown> | null => {
	switch (true) {
		case typeof Text !== "string":
			return null;
	}
	try {
		return (JSON.parse(Text) ?? null) as Record<string, unknown> | null;
	} catch {
		return null;
	}
};
