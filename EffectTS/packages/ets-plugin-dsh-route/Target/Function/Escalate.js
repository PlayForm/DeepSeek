var t=(n,e)=>{if(e.escalation.enabled&&!(n>=e.escalation.max))return{...e.planner,taskType:"planner",source:"escalated"}};export{t as default};
