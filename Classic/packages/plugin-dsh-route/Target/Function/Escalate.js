import n from"./Ladder.js";var o=(r,e,t)=>{if(e.escalation.enabled&&!(r>=e.escalation.max))return{...n(e,t),taskType:"planner",source:"escalated"}};export{o as default};
