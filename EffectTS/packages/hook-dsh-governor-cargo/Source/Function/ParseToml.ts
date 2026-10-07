// ParseToml — parse a TOML string with smol-toml (the ONE runtime dependency
// of this bundle, carried by its own node_modules — small, zero deps), null
// on any failure. Error-contained — an unreadable or non-TOML Cargo.toml maps
// to null instead of a throw (the caller logs the
// "observed non-JSON/TOML Cargo.toml … — skipped" line).
//
// THE PARSING-ONLY RULE: smol-toml is used for IDENTIFICATION of dependency
// entries — never for serialization. The rewrite (Function/Pin) is surgical
// line-level string manipulation on the raw text so comments, inline
// comments, and formatting survive byte-for-byte; a TOML stringify would
// destroy them. This is an internal calculation, one of the standing
// exemptions.
import { parse as Smol } from "smol-toml";

export default (Text: unknown): Record<string, unknown> | null => {
	switch (true) {
		case typeof Text !== "string":
			return null;
	}
	try {
		return (Smol(Text) ?? null) as Record<string, unknown> | null;
	} catch {
		return null;
	}
};
