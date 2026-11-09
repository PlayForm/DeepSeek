import { Inject } from "@playform/lib-dsh-style";

import Sheet from "../Stylesheet/Plugin.scss";

const IDENTIFIER = "@playform/client-dsh-workspace-live";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
