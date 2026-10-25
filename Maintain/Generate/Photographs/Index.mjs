#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Photographs/Index.mjs - the degenerative photography experiment.
//===============================================================================
//
// Renders every package's halftone exposure to Temporary/Photographs/ plus a
// contact sheet. Each layer carries several colours: the covered layer moves
// through deep/ink/ink2, the bleed layer through accent/accent2/accent3, and
// highlights through tint. The shades are derived from the package palette.
//
// Usage: node Maintain/Generate/Photographs/Index.mjs
import { join } from "node:path";

import Root from "../../Common/Function/Root.mjs";
import Sheet from "../Sheet.mjs";
import Write from "./Function/Write.mjs";

const { Output, Names } = Write(Root);
await Sheet(Output, Names, join(Root, "Temporary", "Photographs-Sheet.png"), "photographs sheet");
