import Styles from "@Function/Styles.js";

import { apply, inject } from "./Client.js";

/**
 * @module Bundle
 *
 * The client bundle's entry: the ESM half plus the plugin's sheet.
 *
 * @remarks
 *
 * Only this entry imports the stylesheet, and only the package's own
 * Configuration/Bundle.mjs compiles it, so the ESM Target/Client.js that the
 * smokes import stays free of it.
 */
Styles();

export { apply, inject };
export default { inject, apply };
