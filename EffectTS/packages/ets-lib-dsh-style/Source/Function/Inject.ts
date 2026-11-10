/**
 * @module Inject
 *
 * Mounts the one `<style>` element every client plugin calls: one element per
 * plugin file, keyed by the data-plugin-css attribute, appended once.
 *
 * @remarks
 *
 * The style is appended once per plugin file; a second call for the same
 * identifier is a no-op.
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
