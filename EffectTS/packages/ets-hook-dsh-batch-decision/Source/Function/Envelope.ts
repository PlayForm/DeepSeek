// Envelope - the inbox block renderer (Function/Envelope): the ONE wire
// format the batch packages share through the harness inbox.
//
//   [BATCH DECISION - <id>]
//   <the canonical decision JSON>
//
// The board's parser (plugin-dsh-batchstate Function/Envelope) reads the
// FIRST such block out of any inbox text, so the marker bytes are a
// cross-package contract (each package declares its own copy - the
// self-contained rule): `[BATCH DECISION - ` on its own line, the JSON body
// starting on the next line.
import type { BatchDecision } from "@Interface/Batch.js";

export default (Decision: BatchDecision): string =>
	`[BATCH DECISION - ${Decision.proposal}]\n${JSON.stringify(Decision)}`;
