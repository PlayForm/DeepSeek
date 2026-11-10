import { Inject } from "@playform/lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

/**
 * @module Styles
 *
 * The stylesheet mount: one injected sheet under the package's own identifier.
 */
const IDENTIFIER = "@playform/client-dsh-panel-cost";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
