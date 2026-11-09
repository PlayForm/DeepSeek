/**
 * @module Inject
 *
 * The one `<style>` mount every client plugin calls: one element per plugin
 * file, keyed by the `data-plugin-css` attribute, appended once.
 */
export default function Inject(Identifier: string, Sheet: string): void {
	if (typeof document === "undefined") return;
	const File = `${Identifier}/client.css`;
	if (document.querySelector(`style[data-plugin-css="${File}"]`) !== null) return;
	const Element = document.createElement("style");
	Element.dataset.plugin = Identifier;
	Element.dataset.pluginCss = File;
	Element.textContent = Sheet;
	document.head.append(Element);
}
