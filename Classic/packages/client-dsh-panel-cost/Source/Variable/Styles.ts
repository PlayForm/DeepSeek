// Styles - the panel's stylesheet as one Variable: a template literal the
// client injects once per page through Function/Styles. The panel is a grid
// under the conversation tab surface, so it sizes to the tab body and
// scrolls its own overflow rather than fighting the shell's layout.
export default `
.playform-cost-panel {
	display: grid;
	gap: 12px;
	box-sizing: border-box;
	width: 100%;
	max-width: 1180px;
	min-height: 0;
	margin: 0 auto;
	padding: 16px 16px 28px;
	overflow: auto;
	color: var(--dsw-alias-label-primary);
	font-size: var(--dsw-font-xs-13, 13px);
}

.playform-cost-panel > p {
	margin: 0;
	padding: 24px 16px;
	color: var(--dsw-alias-label-secondary);
	font-size: 13px;
	line-height: 20px;
	text-align: center;
}
`;
