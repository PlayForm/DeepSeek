// Library - the entry module of the workspace-live LIBRARY
// (@playform/lib-dsh-workspace-live): the shared client machinery of the
// Workspace Plugin Family's live view, as NAMED exports (the harness
// convention - the library is NOT a plugin bundle: no loader contract, no
// cordis patch, no Config, no apply, publishable on its own; the
// ets-base-dsh precedent).
//
// Three exports, the SHARED-LIBRARY.md commonality split (the render/
// collapse half; the consumers keep their own ledger strings, tools and
// configs - the module leaves are never absorbed):
//
//   Section (types) - the operational-view section types: SectionKind,
//       Section, PacketView (the orientation packet's shape, V4-1 §3.5).
//   Render - the section framer: one Section -> one framed text block,
//       version-stamped in the frame header.
//   Collapse - the budget collapse: framed sections fitted to a byte
//       budget, the overflow replaced by one-line summaries (never dropped).
//   Packet - the orientation-packet renderer: PacketView -> the fixed
//       eight-line WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE
//       grammar.
import Version from "./Variable/Version.js";

// The compiled package version (Source/Variable/Version, built in by the
// ESBuild define). This package has NO loader contract and NO Config - the
// version sits beside the other named exports; it is not a loader key.
export { Version };

export type { PacketView, Section, SectionKind } from "./Interface/Section.js";
export { default as Render } from "./Function/Render.js";
export { default as Collapse } from "./Function/Collapse.js";
export type { CollapseEntry } from "./Function/Collapse.js";
export { default as Packet } from "./Function/Packet.js";
