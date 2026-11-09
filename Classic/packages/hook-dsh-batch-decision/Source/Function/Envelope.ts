/**
 * @module Envelope
 *
 * The inbox block renderer: the ONE wire format the batch packages share
 * through the harness inbox.
 *
 * @remarks
 * The wire shape is a `[BATCH DECISION - <id>]` marker line followed by the
 * canonical decision JSON on the next line. The board's parser
 * (plugin-dsh-batchstate Function/Envelope) reads the FIRST such block out of
 * any inbox text, so the marker bytes are a cross-package contract (each
 * package declares its own copy - the self-contained rule): `[BATCH DECISION
 * - ` on its own line, the JSON body starting on the next line.
 */
import type { BatchDecision } from "@Interface/Batch.js";

export default (Decision: BatchDecision): string =>
	`[BATCH DECISION - ${Decision.proposal}]\n${JSON.stringify(Decision)}`;
