import type { CallView, Detection, Intent } from "../Interface/Execution.js";
export default _default;
declare function _default(
/** The pack: the intents in priority order. */
Pack: Intent[], 
/** The current judged call. */
Call: CallView, 
/** The ring: the last calls' intent ids, oldest first (the most recent 4 are read). */
Intents: string[], 
/** The user text (the latest user message), lowercased. */
UserText: string): Detection[];
