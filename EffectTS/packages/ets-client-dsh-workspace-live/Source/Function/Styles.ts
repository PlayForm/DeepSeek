import { Inject } from "@playform/ets-lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

/**
 * @module Styles
 *
 * The plugin's stylesheet mount for the live client.
 *
 * @remarks
 *
 * Injects the compiled `Stylesheet/Plugin.scss` sheet under the package's
 * identifier `@playform/client-dsh-workspace-live` through the shared style
 * injector; only the bundle entry (`Source/Bundle.ts`) calls it.
 */
const IDENTIFIER = "@playform/client-dsh-workspace-live";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
