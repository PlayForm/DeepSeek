export default `
.playform-workspace-live {
	display: grid;
	flex: 1;
	gap: 12px;
	align-content: start;
	box-sizing: border-box;
	width: 100%;
	max-width: 880px;
	min-height: 0;
	margin: 0 auto;
	padding: 20px 16px 28px;
	overflow: auto;
}

.playform-workspace-header {
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--dsw-alias-label-primary);
	font-size: 13px;
	font-weight: 600;
	line-height: 18px;
}

.playform-workspace-dot {
	flex: none;
	width: 7px;
	height: 7px;
	background: var(--dsw-alias-state-idle-primary);
	border-radius: 50%;
	corner-shape: round;
}

.playform-workspace-dot[data-live="true"] {
	background: var(--dsw-alias-state-success-primary);
}

.playform-workspace-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.playform-workspace-count {
	margin-left: auto;
	color: var(--dsw-alias-label-secondary);
	font-size: 11px;
	font-weight: 500;
	line-height: 16px;
}

.playform-workspace-representations {
	display: grid;
	gap: 8px;
	margin: 0;
	padding: 0;
	list-style: none;
}

.playform-workspace-representations li {
	display: grid;
	gap: 2px;
	box-sizing: border-box;
	padding: 10px 12px;
	background: var(--dsw-alias-settings-card-fill);
	border: 0.5px solid var(--dsw-alias-settings-card-stroke);
	border-radius: var(--dsw-radius-lg);
}

.playform-workspace-representation-label {
	overflow: hidden;
	color: var(--dsw-alias-label-primary);
	font-size: 13px;
	font-weight: 500;
	line-height: 18px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.playform-workspace-representation-meta {
	color: var(--dsw-alias-label-secondary);
	font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);
	font-size: 11px;
	line-height: 16px;
}

.playform-workspace-live > p {
	margin: 0;
	padding: 24px 16px;
	color: var(--dsw-alias-label-secondary);
	font-size: 13px;
	line-height: 20px;
	text-align: center;
	background: var(--dsw-alias-settings-card-fill);
	border: 0.5px dashed var(--dsw-alias-border-l2);
	border-radius: var(--dsw-radius-lg);
}

.playform-workspace-trace {
	display: grid;
	gap: 2px;
	margin: 0;
	padding: 8px 10px;
	max-height: 160px;
	overflow: auto;
	list-style: none;
	color: var(--dsw-alias-label-secondary);
	font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);
	font-size: 11px;
	line-height: 16px;
	background: var(--dsw-alias-bg-layer-1);
	border: 0.5px solid var(--dsw-alias-border-l1);
	border-radius: var(--dsw-radius-md);
}

.playform-workspace-trace li {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.playform-workspace-trace li[data-kind="batch/decision"],
.playform-workspace-trace li[data-kind="batch/state-change"] {
	color: var(--dsw-alias-brand-primary);
}

.playform-workspace-live[data-live="false"] .playform-workspace-trace {
	opacity: 0.55;
}

.playform-family-section .playform-workspace-live {
	max-width: none;
	margin: 0;
	padding: 0;
	overflow: visible;
}

.playform-family-section .playform-workspace-header {
	display: none;
}
`;
