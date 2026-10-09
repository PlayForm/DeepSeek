// Match — the exclusion-first check: any path segment matching an excluded
// name means the file is skipped. No List (or empty) excludes nothing. Pure
// internal calculation — part of the standing exemptions. Byte-identical
// with the trio's Function/Match.
import { sep as Separator } from "node:path";

export default (Path: string, List: string[] | null | undefined): boolean => {
	switch (true) {
		case !List || List.length === 0:
			return false;
	}
	return Path.split(Separator).some((Segment) => List.includes(Segment));
};
