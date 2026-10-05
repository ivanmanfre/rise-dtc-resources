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
 const contribution=Number((n.net-n.product-n.fulfillment-n.fees-n.returns).toFixed(2))+0;
 const allowance=Number((contribution-n.residual).toFixed(2))+0;
 let cvr=null;
 if(values.cvr!==undefined&&values.cvr!==null&&String(values.cvr).trim()!==''){
  cvr=Number(values.cvr);
  if(!Number.isFinite(cvr)||cvr<0||cvr>100)return {valid:false,error:'New-customer conversion rate must be between 0% and 100%, or left blank.'};
 }
 const maxCAC=Math.max(0,allowance),maxCPC=cvr===null?null:maxCAC*cvr/100;
 if(!Number.isFinite(contribution)||!Number.isFinite(allowance)||(maxCPC!==null&&!Number.isFinite(maxCPC)))return {valid:false,error:'These money amounts are too large to calculate. Enter smaller amounts per first order.'};
 return {valid:true,contribution,allowance,maxCAC,targetFeasible:allowance>=0,maxCPC,cvr};
}
if(typeof module==='object'&&module.exports)module.exports={calculate}; else root.RiseMath={calculate};
})(typeof window==='undefined'?globalThis:window);
