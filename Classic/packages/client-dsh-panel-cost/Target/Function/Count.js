import n from"../Variable/Dash.js";function t(r){return typeof r!="number"||!Number.isFinite(r)?n:String(Math.round(r)).replace(/\B(?=(\d{3})+(?!\d))/g,",")}export{t as default};
