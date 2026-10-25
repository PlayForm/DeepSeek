export default `
.playform-family-tab {
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

.playform-family-tab > p {
	margin: 0;
	padding: 24px 16px;
	color: var(--dsw-alias-label-secondary);
	font-size: 13px;
	line-height: 20px;
	text-align: center;
}

.playform-family-section {
	display: grid;
	gap: 8px;
	box-sizing: border-box;
	padding: 14px 16px 16px;
	background: var(--dsw-alias-settings-card-fill);
	border: 0.5px solid var(--dsw-alias-settings-card-stroke);
	border-radius: var(--dsw-radius-xl);
}

.playform-family-section h3 {
	margin: 0;
	color: var(--dsw-alias-label-primary);
	font-size: 13px;
	font-weight: 600;
	line-height: 18px;
}

.playform-family-status {
	display: flex;
	align-items: center;
	gap: 6px;
	margin: 0;
	color: var(--dsw-alias-label-secondary);
	font-size: 11px;
	font-weight: 500;
	line-height: 16px;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.playform-family-status::before {
	content: "";
	flex: none;
	width: 6px;
	height: 6px;
	background: var(--dsw-alias-state-idle-primary);
	border-radius: 50%;
	corner-shape: round;
}

.playform-family-section[data-activation="enabled"] .playform-family-status::before {
	background: var(--dsw-alias-state-success-primary);
}

.playform-family-section[data-activation="unknown"] .playform-family-status::before {
	background: var(--dsw-alias-state-warn-primary);
}

.playform-family-tail {
	display: grid;
	gap: 2px;
	margin: 0;
	padding: 8px 10px;
	max-height: 136px;
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

.playform-family-tail li {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.playform-family-tail li[data-kind="observe/stamp"] {
	color: var(--dsw-alias-brand-primary);
}

.playform-family-form {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 10px 12px;
	margin: 2px 0 0;
}

.playform-family-field {
	display: grid;
	gap: 4px;
	min-width: 0;
	color: var(--dsw-alias-label-primary);
	font-size: 12px;
	line-height: 16px;
}

.playform-family-field-label {
	overflow: hidden;
	color: var(--dsw-alias-label-secondary);
	text-overflow: ellipsis;
	white-space: nowrap;
}

.playform-family-field input[type="text"],
.playform-family-field input[type="number"],
.playform-family-field select {
	box-sizing: border-box;
	width: 100%;
	height: 28px;
	padding: 0 8px;
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
	background: var(--dsw-alias-bg-layer-1);
	border: 0.5px solid var(--dsw-alias-border-l1);
	border-radius: var(--dsw-radius-sm);
	outline: none;
}

.playform-family-field input[type="text"]:focus-visible,
.playform-family-field input[type="number"]:focus-visible,
.playform-family-field select:focus-visible {
	border-color: var(--dsw-alias-brand-primary);
	outline: 2px solid var(--dsw-alias-brand-primary);
	outline-offset: 1px;
}

.playform-family-field input[type="checkbox"] {
	width: 14px;
	height: 14px;
	margin: 2px 0 0;
	accent-color: var(--dsw-alias-brand-primary);
}

.playform-family-field-override {
	justify-self: start;
	padding: 1px 7px;
	color: var(--dsw-alias-brand-primary);
	font-size: 10px;
	font-weight: 500;
	line-height: 14px;
	background: var(--dsw-alias-bg-layer-1);
	border: 0.5px solid var(--dsw-alias-border-l2);
	border-radius: 999px;
	corner-shape: round;
}

.playform-family-field-secret {
	color: var(--dsw-alias-label-secondary);
	font-size: 12px;
	font-style: italic;
}

.playform-family-form-note {
	margin: 0;
	color: var(--dsw-alias-label-secondary);
	font-size: 12px;
	line-height: 18px;
}

.playform-family-overlay {
	box-sizing: border-box;
	display: grid;
	gap: 12px;
	width: 100%;
	max-height: 80vh;
	padding: 20px;
	overflow: auto;
	background: var(--dsw-alias-bg-overlay);
	border: 0;
	border-radius: var(--dsw-radius-panel);
	box-shadow: var(--dsw-elevation-panel);
}
`;
