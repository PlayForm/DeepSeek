import { Inject } from "@playform/ets-lib-dsh-style";
import Sheet from "@Variable/Styles.js";

const IDENTIFIER = "@playform/ets-client-dsh-panel-family";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
