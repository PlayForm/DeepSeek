import { PromptOne, PromptTwo } from "@Variable/Blocks.js";

/**
 * @module Prompt
 *
 * The phase prompt, selected from the byte-stable texts in `Variable/Blocks` and never
 * assembled at call time.
 *
 * @remarks
 *
 * WHY THERE IS NO ASSEMBLY HERE: the prompt is the contract the strict parser
 * enforces, so the two texts are constants and this leaf only picks one. A composer
 * would let a caller's argument (a focus, a count, a date) reach the model, and the
 * smoke that asserts the text byte for byte would then be asserting a template rather
 * than the product. The plan states the split: phase 1 and phase 2 are identical up to
 * the closing schema section (plan section 5), and `PromptOne`/`PromptTwo` are that
 * identity expressed as data.
 *
 * THE PHASE IS A CLOSED TWO-VALUE SET, and the default arm answers phase 1: a caller
 * that somehow passes a third value gets the fuller prompt, which is the safe
 * direction - the plan prompt asks for a plan and describes both requests, so it can
 * never mis-describe a request the model is answering.
 */
export default (Phase: 1 | 2): string => {
	switch (true) {
		case Phase === 2:
			return PromptTwo;
		default:
			return PromptOne;
	}
};
