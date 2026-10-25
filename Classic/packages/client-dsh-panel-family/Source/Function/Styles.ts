import Sheet from "@Variable/Styles.js";

const IDENTIFIER = "@playform/client-dsh-panel-family";
const FILE = `${IDENTIFIER}/client.css`;

export default function Styles(): void {
	if (typeof document === "undefined") return;
	if (document.querySelector(`style[data-plugin-css="${FILE}"]`) !== null) return;
	const Element = document.createElement("style");
	Element.dataset.plugin = IDENTIFIER;
	Element.dataset.pluginCss = FILE;
	Element.textContent = Sheet;
	document.head.append(Element);
}
