import { Inject } from "@playform/ets-lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

/**
 * @module Styles
 *
 * The plugin's stylesheet mount.
 *
 * @remarks
 *
 * Injects the compiled plugin sheet into the client under the package
 * identifier, so the panel and its sections carry the family's styles.
 */
const IDENTIFIER = "@playform/ets-client-dsh-panel-family";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
