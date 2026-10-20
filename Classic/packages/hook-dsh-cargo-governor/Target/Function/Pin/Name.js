var r=t=>{const s=/^\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([A-Za-z0-9_\-]+))\s*=\s*(.*)$/.exec(t);return!0===!s?null:{key:s[1]??s[2]??s[3],rest:s[4]}};export{r as default};
