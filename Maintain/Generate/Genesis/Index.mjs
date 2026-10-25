#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Genesis/Index.mjs - the degenerative icon set, built from scratch.
//===============================================================================
//
// This is a parallel, experimental generator: it ignores the motif library and
// the atlas entirely. Each icon is the residue of a decayed seed polygon, and
// the decay schedule comes from the package's inferred profile.
//
// Output: Temporary/Genesis/<dir>.svg and Temporary/Genesis-Sheet.png.
//
// Usage: node Maintain/Generate/Genesis/Index.mjs
import { join } from "node:path";

import Root from "../../Common/Function/Root.mjs";
import Sheet from "../Sheet.mjs";
import Write from "./Function/Write.mjs";

const { Output, Names } = Write(Root);
await Sheet(Output, Names, join(Root, "Temporary", "Genesis-Sheet.png"), "genesis sheet");
