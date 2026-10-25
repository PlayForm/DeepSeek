import { createHash } from "node:crypto";

// The recorded hash: SHA-256 over the normalized UTF-8 text, hex.
export default (Text) => createHash("sha256").update(Text, "utf8").digest("hex");
