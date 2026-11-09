import Inject from "@playform/lib-dsh-style";
import Sheet from "@Variable/Styles.js";

const IDENTIFIER = "@playform/client-dsh-panel-family";

export default function Styles(): void {
	Inject(IDENTIFIER, Sheet);
}
