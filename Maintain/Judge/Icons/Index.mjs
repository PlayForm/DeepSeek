#!/usr/bin/env node
//===============================================================================
// Maintain/Judge/Icons/Index.mjs - judge every icon, pick the best, and measure how they play.
//===============================================================================
//
// Requirements being judged:
//   1. distinctness   - no icon may sit next to another in descriptor space
//   2. richness       - enough solid paths to read as a layered icon
//   3. legibility     - an ink budget that survives 40 px
//   4. balance        - visual mass near the centre
//   5. no flooding    - the solid area must not swamp the box
//   6. contrast       - the planes must differ in weight
//   7. plays well     - neighbours must be close enough to read as a family,
//                       far enough to stay individuals
//
// Output: Temporary/Judgement.json + a ranked summary.
//
// Usage: node Maintain/Judge/Icons/Index.mjs
import Root from "../../Common/Function/Root.mjs";
import { genomeOf, packages } from "../../Icon/Index.mjs";
import Judge from "./Function/Judge.mjs";
import Measure from "./Function/Measure.mjs";
import Report from "./Function/Report.mjs";
import Write from "./Function/Write.mjs";

const Measures = packages(Root)
	.map((Entry) => genomeOf(Root, Entry))
	.map(Measure);
const Judgement = { Measures, ...Judge(Measures) };
Write(Root, Judgement);
Report(Judgement);
