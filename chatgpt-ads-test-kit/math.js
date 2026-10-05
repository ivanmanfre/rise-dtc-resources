(function(root){
'use strict';
function calculate(values){
 const required=['net','product','fulfillment','fees','returns','residual'];
 const n={};
 for(const key of required){
  if(values[key]===null||values[key]===undefined||String(values[key]).trim()==='')return {valid:false,error:'Complete every money field. Enter 0 for a cost that does not apply.'};
  n[key]=Number(values[key]);
  if(!Number.isFinite(n[key])||n[key]<0)return {valid:false,error:'Money fields must contain a finite number of zero or more.'};
 }
 const contribution=n.net-n.product-n.fulfillment-n.fees-n.returns;
 const allowance=contribution-n.residual;
 let cvr=null;
 if(values.cvr!==undefined&&values.cvr!==null&&String(values.cvr).trim()!==''){
  cvr=Number(values.cvr);
  if(!Number.isFinite(cvr)||cvr<0||cvr>100)return {valid:false,error:'New-customer conversion rate must be between 0% and 100%, or left blank.'};
 }
 return {valid:true,contribution,allowance,maxCAC:Math.max(0,allowance),targetFeasible:allowance>=0,maxCPC:cvr===null?null:Math.max(0,allowance)*cvr/100,cvr};
}
if(typeof module==='object'&&module.exports)module.exports={calculate}; else root.RiseMath={calculate};
})(typeof window==='undefined'?globalThis:window);
