// Bundle - the client bundle's entry: the ESM half plus the plugin's sheet.
// Only this entry imports the stylesheet, and only the bundler compiles it
// (Maintain/Build/Client-Bundle), so the ESM Target/Client.js that the smokes
// import stays free of it.
import Styles from "@Function/Styles.js";

import { apply, inject } from "./Client.js";

Styles();

export { apply, inject };
export default { inject, apply };
