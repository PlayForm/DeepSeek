// Service - the provided pattern service's typed view. The augmentation
// publishes the typed vocabulary on the cordis Context, so `ctx.pattern` is
// fully typed at every consumption site (the suggester hooks, the decision
// hook's allowlist reader). The class arrives TYPE-ONLY from this package's
// own entry (erased at build - no runtime self-import cycle).
import type PatternService from "../Library.js";

declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The pattern service (the registry, the matcher, the learner). */
		pattern: PatternService;
	}
}
