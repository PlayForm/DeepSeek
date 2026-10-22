var o=e=>{let t=0,s=0;for(const i of e.Records.values())t+=i.nodes.length,s+=i.edges.length;return{files:e.Records.size,nodes:t,edges:s,indexRevision:String(e.Revision)}};export{o as default};
