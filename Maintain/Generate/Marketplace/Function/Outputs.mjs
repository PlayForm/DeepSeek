import { join } from "node:path";

import Root from "../../../Common/Function/Root.mjs";

// The index is written into this repository only. The site is its own
// repository: it reads this file through its Module/DeepSeek submodule and
// publishes its own copy at build time, so a write into Site/ here would be a
// write into another repository's working tree.
export default () => [join(Root, "marketplace.json")];
