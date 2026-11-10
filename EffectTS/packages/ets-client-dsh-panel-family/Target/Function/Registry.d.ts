/**
 * @module Registry
 *
 * The slot-aware family panel registry (the playformFamilyPanel service
 * body).
 *
 * @remarks
 * Sections are stored by id; re-registering the same id replaces it in place
 * (an HMR reload rebinds the closure without duplicating it). The registry is
 * slot-aware (the v4.1 model): every section belongs to one declared child
 * slot, and the registry enforces one adapter per bundle per slot - a second
 * adapter id claiming an occupied (slot, bundle) pair is refused with the
 * documented line (Variable/Lines.ts) and changes nothing. A legacy
 * registration that omits `slot` is mapped from its `mount`
 * (family-tab -> playform.panel.section, overlay -> playform.panel.overlay).
 * unregister removes the section, releases its slot ownership, and cascades
 * the overlay views it opened. entries(slot?) snapshots the current sections
 * ordered by (order, id), optionally filtered to one slot. Every accepted
 * mutation bumps the version and notifies the subscribers.
 */
import type { LaunchTarget, PanelRegistry } from "@Interface/Panel.js";
export default function Registry(Log?: (line: string) => void): PanelRegistry & {
    Open: (target: LaunchTarget) => void;
    AttachOpen: (open: (target: LaunchTarget) => void) => void;
};
