/**
 * @module Render
 *
 * The packet's text form (Function/Render): the eight fixed sections in the
 * V4-1 section 3.5 order, one section header per line followed by that
 * section's lines.
 *
 * @remarks
 * The STALE section is omitted entirely when the caller is current (the
 * contract: "STALE <the version the caller held, if it differs>"). This is
 * the exact text the token measurement and the budget clamp run against.
 */
import type Packet from "../Interface/Packet.js";
export default _default;
declare function _default(Item: Packet): string;
