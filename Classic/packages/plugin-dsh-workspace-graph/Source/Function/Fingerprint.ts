import { createHash } from "node:crypto";

import Normalize from "./Normalize.js";

/**
 * @module Fingerprint
 *
 * The content-derived fingerprint: sha256 over the normalized text, the kind and the
 * name.
 *
 * @remarks
 *
 * The formula is the brief's section 4.1: sha256(normalized text + "\n" + kind + "\n" +
 * name) in hex, where the normalized text is the node's span text with CRLF -> LF and
 * trailing whitespace stripped per line.
 *
 * The stable id survives edits; the fingerprint detects content change. A node without
 * a name hashes the empty name.
 */
export default (Text: string, Kind: string, Name = ""): string =>
	createHash("sha256")
		.update(`${Normalize(Text)}\n${Kind}\n${Name}`)
		.digest("hex");
