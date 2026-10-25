#!/usr/bin/env node
//===============================================================================
// Maintain/Generate/Specimens/Index.mjs - the method specimen sheet CLI.
//===============================================================================
//
// Writes the inspection artefact the next milestone requires, BEFORE any mass
// regeneration of the 102 icons:
//
//   Reference/Specimens/Views.svg          nine construction specimens, each as
//                                          centerline / envelope / footprint
//   Reference/Specimens/Compositions.svg   four deliberately different scenes
//   Reference/Specimens/index.md           the specimen catalogue + clearance
//                                          numbers (a negative margin is an
//                                          overlap)
//
// Usage: node Maintain/Generate/Specimens/Index.mjs
//===============================================================================
import Root from "../../Common/Function/Root.mjs";
import Write from "./Function/Write.mjs";

const { Views, Compositions } = Write(Root);
process.exit(Views.failed.length + Compositions.failed.length === 0 ? 0 : 1);
