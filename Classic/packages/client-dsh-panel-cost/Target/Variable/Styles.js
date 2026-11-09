var a=`
.playform-cost-root {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding-bottom: calc(var(--dsh-composer-height, 152px) + 8px);
  color: var(--dsw-alias-label-primary);
  font: var(--dsw-font-xxs-12);
}

.playform-cost-scroll {
  box-sizing: border-box;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 16px;
}

.playform-cost-scroll > :first-child {
  margin-top: 12px;
}

.playform-cost-empty {
  padding: 24px 0;
  color: var(--dsw-alias-label-secondary);
}

.playform-cost-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  font: var(--dsw-font-xxs-12);
  font-variant-numeric: tabular-nums;
}

.playform-cost-table col:nth-child(1) {
  width: 11%;
}

.playform-cost-table col:nth-child(2) {
  width: 15%;
}

.playform-cost-table col:nth-child(3) {
  width: 13%;
}

.playform-cost-table col:nth-child(4) {
  width: 6.5%;
}

.playform-cost-table col:nth-child(5) {
  width: 6.5%;
}

.playform-cost-table col:nth-child(6) {
  width: 7.5%;
}

.playform-cost-table col:nth-child(7) {
  width: 7%;
}

.playform-cost-table col:nth-child(8) {
  width: 7%;
}

.playform-cost-table col:nth-child(9) {
  width: 7%;
}

.playform-cost-table col:nth-child(10) {
  width: 7.5%;
}

.playform-cost-table col:nth-child(11) {
  width: 12%;
}

.playform-cost-th,
.playform-cost-th-left {
  position: sticky;
  z-index: 2;
  top: 0;
  box-sizing: border-box;
  padding: 4px 8px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  background-clip: padding-box;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxs-12);
  font-weight: 500;
  line-height: 1.25;
  vertical-align: bottom;
  white-space: normal;
  text-align: left;
}

.playform-cost-turn-row {
  cursor: pointer;
}

.playform-cost-turn-cell,
.playform-cost-turn-metric,
.playform-cost-turn-files,
.playform-cost-model-cell-turn {
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 6px 8px;
  border-top: 0.5px solid var(--dsw-alias-border-l2);
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  white-space: nowrap;
}

.playform-cost-turn-cell {
  overflow: hidden;
  font-weight: 600;
  white-space: normal;
}

.playform-cost-turn-metric {
  font-weight: 600;
  text-align: left;
}

.playform-cost-turn-files {
  white-space: nowrap;
}

.playform-cost-turn-clock {
  color: var(--dsw-alias-label-secondary);
  font-weight: 400;
}

.playform-cost-row-toggle {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.playform-cost-row-toggle:focus-visible {
  outline: 1px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}

.playform-cost-older {
  display: flex;
  justify-content: center;
  padding: 2px 0 10px;
}

.playform-cost-older-status {
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xxs-12);
}

.playform-cost-step-row-clickable {
  cursor: pointer;
}

.playform-cost-step-row-error {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
}

.playform-cost-step-cell {
  box-sizing: border-box;
  height: 30px;
  padding: 0 8px 0 22px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  box-shadow: inset 2px 0 0 var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}

.playform-cost-step-metric,
.playform-cost-step-files,
.playform-cost-prompt-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  height: 30px;
  padding: 0 8px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  white-space: nowrap;
}

.playform-cost-step-metric {
  text-align: left;
}

.playform-cost-step-when {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
  vertical-align: middle;
}

.playform-cost-step-clock {
  color: var(--dsw-alias-label-primary);
}

.playform-cost-state-unpriced {
  margin-left: 6px;
  color: var(--dsw-alias-label-secondary);
  font-weight: 400;
}

.playform-cost-state-error,
.playform-cost-state-attempts {
  margin-left: 6px;
  color: var(--dsw-alias-state-warn-primary);
  font-weight: 400;
}

.playform-cost-detail-hint {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
  font-weight: 400;
}

.playform-cost-model-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.playform-cost-model-clip {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.playform-cost-model-clip .playform-cost-model-text {
  flex: 1;
  min-width: 0;
  max-width: none;
}

.playform-cost-model-pill {
  flex: none;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 4px;
  padding: 0 4px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 4px;
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xxxs-11);
}

.playform-cost-files-clip {
  display: inline-block;
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.playform-cost-files-sep {
  margin: 0 4px;
  color: var(--dsw-alias-label-caption);
}

.playform-cost-files-stat {
  color: var(--dsw-alias-label-primary);
}

.playform-cost-added {
  color: var(--dsw-alias-state-success-primary);
}

.playform-cost-removed {
  color: var(--dsw-alias-state-error-primary);
}

.playform-cost-count-badge {
  display: inline-flex;
  align-items: center;
  height: 19px;
  margin: 0 3px;
  padding: 0 5px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 650;
  line-height: 14px;
  vertical-align: bottom;
}

.playform-cost-fail-pill {
  display: inline-flex;
  align-items: center;
  height: 19px;
  margin-right: 6px;
  padding: 0 6px;
  border-radius: 2px;
  background: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-bg-base);
  font-size: 10px;
  font-weight: 650;
  line-height: 14px;
  vertical-align: bottom;
}

.playform-cost-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  max-width: 380px;
}

.playform-cost-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 19px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 650;
}

.playform-cost-pill-muted {
  color: var(--dsw-alias-label-secondary);
}

.playform-cost-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  corner-shape: round;
  display: inline-block;
  background: var(--playform-cost-tone, var(--dsw-alias-label-secondary));
}

.playform-cost-mix {
  display: flex;
  height: 4px;
  max-width: 380px;
  margin-top: 5px;
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
}

.playform-cost-mix-segment {
  display: block;
  background: var(--playform-cost-tone, var(--dsw-alias-label-secondary));
}

.playform-cost-tone0 {
  --playform-cost-tone: var(--dsw-alias-state-business-primary);
}

.playform-cost-tone1 {
  --playform-cost-tone: var(--dsw-alias-state-success-primary);
}

.playform-cost-tone2 {
  --playform-cost-tone: var(--dsw-alias-state-warn-primary);
}

.playform-cost-tone3 {
  --playform-cost-tone: var(--dsw-alias-state-error-secondary);
}

.playform-cost-tone4 {
  --playform-cost-tone: var(
  	--dsw-alias-brand-primary-new-colorprimary-new-color,
  	var(--dsw-alias-brand-primary)
  );
}

.playform-cost-tone5 {
  --playform-cost-tone: var(--dsw-alias-state-success-secondary);
}

.playform-cost-tone6 {
  --playform-cost-tone: var(--dsw-alias-state-warn-label);
}

.playform-cost-tone7 {
  --playform-cost-tone: var(--dsw-alias-label-caption);
}

.playform-cost-num {
  display: inline-block;
  min-width: 62px;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.playform-cost-num-delta {
  display: inline-block;
  min-width: 62px;
  font: var(--dsw-font-xxxs-11);
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.playform-cost-delta-up {
  color: var(--dsw-alias-state-success-primary);
}

.playform-cost-delta-down {
  color: var(--dsw-alias-state-error-primary);
}

.playform-cost-money {
  display: inline-block;
  min-width: 68px;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.playform-cost-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.playform-cost-bar-turn {
  display: inline-block;
  box-sizing: border-box;
  flex: 1;
  min-width: 40px;
  height: 14px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
  vertical-align: middle;
}

.playform-cost-bar-step {
  display: inline-block;
  flex: 1;
  min-width: 32px;
  height: 6px;
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
  vertical-align: middle;
}

.playform-cost-bar-fill {
  display: flex;
  height: 100%;
}

.playform-cost-bar-segment {
  display: block;
  height: 100%;
}

.playform-cost-bar-cache {
  background: var(--dsw-alias-state-business-primary);
  opacity: 0.5;
}

.playform-cost-bar-input {
  background: var(--dsw-alias-state-business-primary);
}

.playform-cost-bar-output {
  background: var(--dsw-alias-state-warn-primary);
}

.playform-cost-bar-other {
  background: var(--dsw-alias-label-caption);
}

.playform-cost-bar-value {
  min-width: 58px;
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.playform-cost-more-cell {
  padding: 2px 8px 8px;
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xxxs-11);
  line-height: 1.9;
  white-space: normal;
}

.playform-cost-more-text {
  margin-right: 10px;
}

.playform-cost-chip,
.playform-cost-chip-on {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 19px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 650;
  margin-right: 8px;
  cursor: pointer;
}

.playform-cost-chip-on {
  border-color: var(--dsw-alias-state-business-primary);
}

.playform-cost-chip:focus-visible,
.playform-cost-chip-on:focus-visible {
  outline: 1px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}

.playform-cost-detail-cell {
  padding: 6px 8px 12px 22px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  box-shadow: inset 2px 0 0 var(--dsw-alias-border-l1);
  font: var(--dsw-font-xs-13);
}

.playform-cost-detail-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0 8px;
}

.playform-cost-detail-title {
  font: var(--dsw-font-xs-strong-13);
}

.playform-cost-detail-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.playform-cost-block {
  margin-bottom: 10px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  overflow: hidden;
}

.playform-cost-block-head {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 8px;
  background: var(--dsw-alias-bg-layer-2);
  font: var(--dsw-font-xxs-12);
}

.playform-cost-block-path {
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playform-cost-block-meta {
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
  white-space: nowrap;
}

.playform-cost-block-sub {
  padding: 4px 8px 0;
  color: var(--dsw-alias-label-tertiary);
  font: var(--dsw-font-xxxs-11);
}

.playform-cost-block-empty {
  display: block;
  padding: 6px 8px;
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xxxs-11);
}

.playform-cost-block-body {
  padding: 4px 8px 6px;
  color: var(--dsw-alias-label-secondary);
  font: var(--dsw-font-xxs-12);
  white-space: normal;
  overflow-wrap: anywhere;
}

.playform-cost-buckets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin: 0 0 10px;
}

.playform-cost-bucket {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 19px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 650;
}

.playform-cost-bucket-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  corner-shape: round;
}

.playform-cost-bucket-label {
  color: var(--dsw-alias-label-secondary);
}

.playform-cost-bucket-value {
  font-variant-numeric: tabular-nums;
}

.playform-cost-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 20px 0;
  padding: 8px 0;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  font: var(--dsw-font-xxs-12);
}

.playform-cost-summary {
  margin-right: auto;
  color: var(--dsw-alias-label-secondary);
}

.playform-cost-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  row-gap: 6px;
  flex-wrap: wrap;
}

.playform-cost-control-label {
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}

.playform-cost-top-files {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0 20px;
  padding: 6px 0 8px;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  font: var(--dsw-font-xxs-12);
}

.playform-cost-file-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 19px;
  padding: 0 6px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 2px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font-size: 10px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.playform-cost-totals-row td {
  border-top: 0.5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  font-weight: 600;
}

.playform-cost-totals-label {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

.playform-cost-totals-meta {
  color: var(--dsw-alias-label-secondary);
  font-weight: 400;
}

.playform-cost-button {
  padding: 4px 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  font-size: 12px;
}

@media (hover: hover) {
  .playform-cost-button:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}
.playform-cost-button:focus-visible {
  outline: 1px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}

.playform-cost-button-off {
  padding: 4px 10px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: default;
  font-size: 12px;
}`;export{a as default};
