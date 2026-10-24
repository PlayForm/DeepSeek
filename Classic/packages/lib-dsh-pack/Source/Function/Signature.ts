// Signature - whether a directory matches a pack's signature: at least ONE
// of the pack's marker paths exists under it (OR, not AND: a repo may carry
// more than one marker and any one identifies it). A pack without a
// signature falls back to the default marker, so the pre-pack gate's
// behaviour is preserved.
import { existsSync } from "node:fs";
import { join } from "node:path";

import type Pack from "../Interface/Pack.js";
import Default from "../Variable/Signature.js";

export default (Pack: Pack, Root: string): boolean => {
	const Markers = Pack.signature ?? Default;
	return Markers.some((Marker) => existsSync(join(Root, Marker)));
};
