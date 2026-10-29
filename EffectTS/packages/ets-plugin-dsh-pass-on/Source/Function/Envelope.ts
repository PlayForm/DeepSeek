// Envelope - the inbox block renderer (Function/Envelope): the ONE wire
// format the batch packages share through the harness inbox.
//
//   [BATCH PROPOSAL - <id>]
//   <the canonical proposal JSON>
//
// The board's parser (plugin-dsh-batchstate Function/Envelope) reads the
// FIRST such block out of any inbox text, so the marker bytes are a
// cross-package contract (each package declares its own copy - the
// self-contained rule): `[BATCH PROPOSAL - ` on its own line, the JSON body
// starting on the next line. The JSON is the contract verbatim - the board
// and the decision hook read the same object the pass-on computed.
import type Batch from "../Interface/Batch.js";

export default (Batch: Batch): string => `[BATCH PROPOSAL - ${Batch.id}]\n${JSON.stringify(Batch)}`;
