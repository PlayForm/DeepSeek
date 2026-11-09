import { Inject } from "@playform/lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

const IDENTIFIER = "@playform/client-dsh-panel-family";

/**
 * @module Styles
 *
 * Mount the panel package's stylesheet through the style library's injector.
 *
 * @remarks
 * The sheet is the package's own `Stylesheet/Plugin.scss`, injected once under the
 * `@playform/client-dsh-panel-family` identifier.
 */
export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
