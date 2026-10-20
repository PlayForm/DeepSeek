// Clock - the ONLY time source in the module (the smoke's fake-clock
// requirement, IMPLEMENTATION-DESIGN.md section 7.1: "the plugin reads time
// ONLY through a Clock module ... the smoke advances the clock, never
// sleeps"). Production leaves State.Now undefined and the clock falls back
// to Date.now(); the smoke sets State.Now through the
// `ctx.__hookDshLiveContainersState` probe attachment. Every read is
// defensive: a throwing override degrades to the real clock, never a throw
// into a listener.
import type State from "../Interface/State.js";

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
