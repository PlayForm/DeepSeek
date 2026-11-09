/**
 * @module Knobs
 *
 * The resolved-knob reader: one raw config in, the effective values out.
 *
 * @remarks
 * WHY THIS FILE EXISTS AT ALL when the loader already validates the schema: the
 * service is also constructed bare by the smokes (`new SkillLearnService(ctx)`), and a
 * bare construction never passes through Schemastery. Without this reader a fixture
 * would run on `undefined` knobs and a review would divide by a missing interval. So
 * the defaults of plan section 9 are applied here, in one table, and they are the same
 * values the schema declares in `Variable/Configuration.ts` - one of the two is a
 * duplicate by construction, and the alternative (reading the schema at runtime) would
 * make every knob a deferred lookup that a hot edit could change mid-run.
 *
 * THE VOLATILE CELLS ARE HONOURED: every schema cell is `.volatile()`, which means the
 * loader may hand this reader a cell object rather than a value (`{ get }`), so each
 * field is unwrapped before it is read. A cell that is not unwrapped resolves to a
 * function and silently falls back to the default, which is the failure mode this
 * helper exists to prevent.
 *
 * THE NUMERIC BOUNDS MIRROR THE SCHEMA, AND THEY CLAMP RATHER THAN THROW. The schema's
 * `.min(1)` and `.max(8)` are the loader's refusal; a bare construction bypasses that
 * refusal, so the same bounds are applied here. Clamping is the deliberate choice for
 * the one bound that has a semantic consequence: `maxOperations` "defaults to 8 and may
 * only be lowered", because the prompt states "at most eight objects" byte-stably (plan
 * section 5), so a higher configured value would make the shipped text wrong and is
 * lowered to the text instead. The day thresholds clamp at 1 for the reason plan
 * section 7.1 gives: a cutoff at or past now would transition the whole corpus on one
 * bad config.
 */
import type Configuration from "../Interface/Configuration.js";
export default _default;
declare function _default(Raw: unknown): Configuration;
