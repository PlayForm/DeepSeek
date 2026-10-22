// Clock - the ONLY time source in the module (the live-containers Clock
// precedent, the no-real-timers rule: the smoke advances the clock, never
// sleeps). Production leaves State.Now undefined and the clock falls back to
// Date.now(); the smoke sets State.Now through the
// `ctx.__hookDshWorkspaceMonitorState` probe attachment. Every read is
// defensive: a throwing override degrades to the real clock, never a throw
// into a listener.
import type State from "@Interface/State.js";

export default (Agent: State): number => {
	try {
		switch (true) {
			case typeof Agent.Now === "function":
				return Number(Agent.Now());
			default:
				return Date.now();
		}
	} catch {
		return Date.now();
	}
};
