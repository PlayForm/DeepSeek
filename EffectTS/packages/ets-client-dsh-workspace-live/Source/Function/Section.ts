// Section - the workspace-live section component, registered into the tab's
// declared child slot. Its data crosses through the registration's INJECT
// face (`{ section, ports }`): the ports carry the presentation store and the
// trace tail, never a service handle the section would resolve itself. The
// component subscribes to both sources and unwinds every subscription on
// unmount; a new store snapshot or a new trace envelope is the only reason it
// re-renders (the stable-until-event rule).
import View from "@Function/View.js";
import type { LiveView } from "@Interface/Presentation.js";
import type LiveTrace from "@Interface/Trace.js";
import { createElement, useEffect, useState } from "react";

export default function Section(props: {
	ports: {
		store: {
			getSnapshot: () => LiveView;
			subscribe: (listener: () => void) => () => void;
		};
		trace: LiveTrace;
	};
}): ReturnType<typeof createElement> {
	const [Current, SetCurrent] = useState<LiveView>(() => props.ports.store.getSnapshot());
	const [Tail, SetTail] = useState(() => props.ports.trace.tail());
	useEffect(() => {
		const OffStore = props.ports.store.subscribe(() =>
			SetCurrent(props.ports.store.getSnapshot()),
		);
		const OffTrace = props.ports.trace.subscribe(() => SetTail(props.ports.trace.tail()));
		return () => {
			OffStore();
			OffTrace();
		};
	}, []);
	return createElement(View, {
		view: Current,
		tail: Tail,
		live: props.ports.trace.live,
	});
}
