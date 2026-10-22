// Registry - the family panel registry (the playformFamilyPanel service
// body). Sections are stored by id; re-registering a section replaces it in
// place (an HMR reload rebinds the closure without duplicating it).
// unregister removes the section AND cascades the overlay views it opened
// (the cascade: closing an overlay whose owning section is gone). entries()
// snapshots the current sections ordered by (order, id) - the deterministic
// render order the family tab uses. Every mutation bumps the version and
// notifies the subscribers.
import type { LaunchTarget, PanelRegistry, PanelSection } from "@Interface/Panel.js";

const Ordering = (Left: PanelSection, Right: PanelSection): number => {
	switch (true) {
		case Left.order !== Right.order:
			return Left.order - Right.order;
		default:
			return Left.id < Right.id ? -1 : 1;
	}
};

export default function Registry(): PanelRegistry & {
	Open: (target: LaunchTarget) => void;
	AttachOpen: (open: (target: LaunchTarget) => void) => void;
} {
	const Sections = new Map<string, PanelSection>();
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
			Sections.set(Section.id, Section);
			Notify();
			return () => Self.unregister(Section.id);
		},
		unregister(Id) {
			switch (true) {
				case !Sections.has(Id):
					return;
				default:
					Sections.delete(Id);
					// The cascade: drop the overlay views this section opened.
					for (const View of Opened) {
						switch (true) {
							case View.startsWith(`${Id}:`):
								Opened.delete(View);
						}
					}
					Notify();
			}
		},
		entries() {
			return [...Sections.values()].sort(Ordering);
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
