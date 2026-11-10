import{createHash as t}from"node:crypto";var s=e=>t("sha256").update(e).digest("hex").slice(0,24);export{s as default};
