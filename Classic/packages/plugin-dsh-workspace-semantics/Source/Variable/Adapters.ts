// Adapters - the any-file adapter CATALOG (a Variable: one constant built once
// at load). The names are the config `adapters` vocabulary; each entry is the
// adapter module (Function/Json, Function/Yaml, Function/Markdown,
// Function/Package). The TypeScript adapter is NOT in the catalog: it is the
// default registration and always registers first.
//
// The catalog is the load-time validation source too: a config naming an
// unknown adapter fails LOUD at load with the catalog in the message, never a
// silent skip.
import Json from "@Function/Json.js";
import Markdown from "@Function/Markdown.js";
import Package from "@Function/Package.js";
import Yaml from "@Function/Yaml.js";
import type Adapter from "@Interface/Adapter.js";

export default {
	json: Json,
	yaml: Yaml,
	markdown: Markdown,
	package: Package,
} satisfies Record<string, Adapter>;
