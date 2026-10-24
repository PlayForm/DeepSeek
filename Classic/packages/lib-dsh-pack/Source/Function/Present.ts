// Present - whether a directory can be a workspace at all: it carries a repo
// layer, a user layer for its slug, or the default signature. The locator
// skips every other ancestor without loading a pack, so the walk stays cheap
// on a deep path.
import { existsSync } from "node:fs";
import { join } from "node:path";

import Default from "../Variable/Signature.js";
import Pick from "./Pick.js";
import Repository from "./Repository.js";
import Slug from "./Slug.js";
import User from "./User.js";

export default (Root: string, Home: string): boolean =>
	Pick(Repository(Root)) !== undefined ||
	Pick(User(Slug(Root), Home)) !== undefined ||
	Default.some((Marker) => existsSync(join(Root, Marker)));
