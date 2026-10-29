// Registry - the slot-aware family panel registry (the playformFamilyPanel
// service body). Sections are stored by id; re-registering the same id
// replaces it in place (an HMR reload rebinds the closure without duplicating
// it). The registry is SLOT-AWARE (the v4.1 model): every section belongs to
// one declared child slot, and the registry enforces ONE ADAPTER PER BUNDLE
// PER SLOT - a second adapter id claiming an occupied (slot, bundle) pair is
// refused with the documented line (Variable/Lines.ts) and changes nothing.
// A legacy registration that omits `slot` is mapped from its `mount`
// (family-tab -> playform.panel.section, overlay -> playform.panel.overlay).
// unregister removes the section, releases its slot ownership, and cascades
// the overlay views it opened. entries(slot?) snapshots the current sections
// ordered by (order, id), optionally filtered to one slot. Every accepted
// mutation bumps the version and notifies the subscribers.
import type { LaunchTarget, PanelRegistry, PanelSection, PanelSlot } from "@Interface/Panel.js";
import Lines from "@Variable/Lines.js";
import Slots from "@Variable/Slots.js";

const Ordering = (Left: PanelSection, Right: PanelSection): number => {
	switch (true) {
		case Left.order !== Right.order:
			return Left.order - Right.order;
		default:
			return Left.id < Right.id ? -1 : 1;
	}
};

/** The declared child slot of one section: the v4.1 `slot`, else the legacy mount. */
const SlotOf = (Section: PanelSection): PanelSlot =>
	Section.slot ?? (Section.mount === "overlay" ? Slots.overlay : Slots.section);

/** The ownership key: one adapter per bundle per slot. */
const Key = (Slot: PanelSlot, Bundle: string): string => `${Slot}::${Bundle}`;

export default function Registry(Log?: (line: string) => void): PanelRegistry & {
	Open: (target: LaunchTarget) => void;
	AttachOpen: (open: (target: LaunchTarget) => void) => void;
} {
	const Sections = new Map<string, PanelSection>();
	const Owners = new Map<string, string>();
	const Listeners = new Set<() => void>();
	const Opened = new Set<string>();
	let Version = 0;
	let Open: ((target: LaunchTarget) => void) | undefined;

	const Notify = (): void => {
		Version += 1;
		for (const Listener of Listeners) Listener();
	};

	const Self: PanelRegistry & {
		Open: (target: LaunchTarget) => void;
		AttachOpen: (open: (target: LaunchTarget) => void) => void;
	} = {
		register(Section) {
			const Slot = SlotOf(Section);
			const Ownership = Key(Slot, Section.bundle);
			const Owner = Owners.get(Ownership);
			switch (true) {
				case Owner !== undefined && Owner !== Section.id:
					// One adapter per bundle per slot: the second claim is refused.
					Log?.(Lines.duplicate(Section.bundle, Slot));
					return () => undefined;
				default: {
					const Previous = Sections.get(Section.id);
					switch (true) {
						case Previous !== undefined: {
							const PreviousOwnership = Key(SlotOf(Previous), Previous.bundle);
							switch (true) {
								case Owners.get(PreviousOwnership) === Section.id:
									Owners.delete(PreviousOwnership);
									break;
								default:
									break;
							}
							break;
						}
						default:
							break;
					}
					Sections.set(Section.id, Section);
					Owners.set(Ownership, Section.id);
					Notify();
					return () => Self.unregister(Section.id);
				}
			}
		},
		unregister(Id) {
			const Section = Sections.get(Id);
			switch (true) {
				case Section === undefined:
					return;
				default: {
					Sections.delete(Id);
					const Ownership = Key(SlotOf(Section), Section.bundle);
					switch (true) {
						case Owners.get(Ownership) === Id:
							Owners.delete(Ownership);
							break;
						default:
							break;
					}
					// The cascade: drop the overlay views this section opened.
					for (const View of Opened) {
						switch (true) {
							case View.startsWith(`${Id}:`):
								Opened.delete(View);
								break;
							default:
								break;
						}
					}
					Notify();
				}
			}
		},
		entries(Slot) {
			const All = [...Sections.values()];
			const Selected =
				Slot === undefined ? All : All.filter((Section) => SlotOf(Section) === Slot);
			return Selected.sort(Ordering);
		},
		subscribe(Listener) {
			Listeners.add(Listener);
			return () => Listeners.delete(Listener);
		},
		getVersion() {
			return Version;
		},
		open(Target) {
			Opened.add(`${Target.view}:${Target.focus ?? ""}`);
			switch (true) {
				case Open !== undefined:
					Open(Target);
					break;
				default:
					break;
			}
		},
		// The wiring point: the shell overlay mount supplies the real open
		// implementation (the ui-layout overlay host); until it is attached,
		// open() only records the request.
		AttachOpen(OpenImplementation) {
			Open = OpenImplementation;
		},
		Open(Target) {
			Self.open(Target);
		},
	};
	return Self;
}
