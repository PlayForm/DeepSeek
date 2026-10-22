import type PatternService from "../Library.js";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The pattern service (the registry, the matcher, the learner). */
        pattern: PatternService;
    }
}
