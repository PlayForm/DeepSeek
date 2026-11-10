/**
 * @module Packet
 *
 * Renders the orientation-packet (`WORKSPACE-FAMILY-V4-1.md` section 3.5): the
 * packet is the orient step of the orient -> drill -> act loop, rendered as
 * the fixed eight-line grammar:
 *
 * - `WORKSPACE <name> @ <indexRevision>`
 * - `SCOPE <the query or focus>`
 * - `MAP <the top modules and their one-line roles>`
 * - `FOCUS <the node, its span, its fingerprint, its version>`
 * - `NEIGHBORS <the strongest edges, ranked>`
 * - `EVIDENCE <the files/spans the packet is built from>`
 * - `OPEN <the questions the packet cannot answer>`
 * - `STALE <the version the caller held, if it differs>`
 *
 * @remarks
 * Multi-value bands (MAP/NEIGHBORS/EVIDENCE/OPEN) render one entry per line
 * under the tag; absent bands render `MAP (none)` style placeholders - the
 * grammar is always COMPLETE, never partially omitted. STALE renders only when
 * the caller's version differs. Pure: PacketView in, text out; the token
 * budget is the CALLER's concern (it owns the counter seam).
 */
import type { PacketView } from "../Interface/Section.js";
export default _default;
declare function _default(View: PacketView): string;
