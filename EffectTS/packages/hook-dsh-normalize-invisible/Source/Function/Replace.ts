// Replace — the THIN DELEGATE: the invisible hook's own name for the CORE's
// generic class→string replacer, pinned to its table. The pattern (and the
// whole Replace mechanism: the function replacer, the per-call regex
// construction, the `{ text, count }` contract) lives in
// @playform/hook-dsh-core's Normalize/Replace + Normalize/Invisible; this
// file supplies only the two arguments that make it THE INVISIBLE FLAVOR:
// the Invisible class (the zero-width/invisible family) and the configured
// replacement (default "" — REMOVAL).
//
// The core resolves through the profile's node_modules link (the package is
// installed as a directory link there); the behavior is the CLASS flavor of
// the family's dispatch — the invisible smoke is the arbiter.
import { Replace, Invisible } from "@playform/hook-dsh-core";

export default (Text: string, Replacement: string): { text: string; count: number } =>
	Replace(Text, Invisible, Replacement);
