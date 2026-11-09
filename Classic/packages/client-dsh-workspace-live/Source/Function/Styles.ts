import { Inject } from "@playform/lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

/**
 * @module Styles
 *
 * The stylesheet mount for the client bundle.
 *
 * @remarks
 * `Inject` registers the package's own stylesheet under the package
 * identifier, so the plugin's sheet ships with the bundle entry only.
 */
const IDENTIFIER = "@playform/client-dsh-workspace-live";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
