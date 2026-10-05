'use strict';
const form=document.getElementById('test-plan');
const moneyKeys=['net','product','fulfillment','fees','returns','residual','cvr'];
const fields=[['situation','Purchase question','What is the buyer trying to decide?'],['claim','Headline / claim','A specific, supportable product claim'],['proof','Evidence source','Product fact, specification or approved source URL'],['destination','Destination URL','The page that answers this question'],['variation','What changes in this variant?','The single difference you want to investigate'],['reason','Why test this variation?','What you expect to learn, without assuming a result']];
for(let i=1;i<=3;i++){
 const section=document.createElement('div');section.className='creative-row';
 const h=document.createElement('h3');h.textContent='Variant '+i;section.append(h);
 const grid=document.createElement('div');grid.className='fields';
 for(const [key,title,placeholder] of fields){const label=document.createElement('label');label.append(document.createTextNode(title));const input=document.createElement('textarea');input.name='variant-'+i+'-'+key;input.rows=2;input.placeholder=placeholder;label.append(input);grid.append(label)}
 section.append(grid);document.getElementById('creative-rows').append(section);
}
function values(){const v={};for(const key of moneyKeys)v[key]=form.elements[key].value;return v}
function money(n){const currency=form.elements.currency.value.trim()||'USD';return currency+' '+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function refresh(){
 const v=values(),r=RiseMath.calculate(v);document.getElementById('calculation-error').hidden=r.valid;document.getElementById('result-values').hidden=!r.valid;
 if(!r.valid){document.getElementById('calculation-error').textContent=r.error;return r}
 document.getElementById('cac-result').textContent=money(r.maxCAC);document.getElementById('contribution-result').textContent=money(r.contribution);
 document.getElementById('cpc-result').textContent=r.maxCPC===null?'Add a CVR':money(r.maxCPC);
 document.getElementById('math-line').textContent=money(Number(v.net))+' − '+money(Number(v.product)+Number(v.fulfillment)+Number(v.fees)+Number(v.returns))+' costs − '+money(Number(v.residual))+' to keep = '+money(r.allowance)+'.';
 document.getElementById('feasibility').textContent=r.targetFeasible?(r.maxCAC===0?'Your inputs leave no paid acquisition budget.':'Compare this ceiling with your matured new-customer acquisition cost.'):'Your contribution target has a '+money(Math.abs(r.allowance))+' shortfall before acquisition. Review the offer economics.';
 return r;
}
form.addEventListener('input',refresh);form.addEventListener('submit',event=>event.preventDefault());refresh();
function rows(){const result=[];for(const el of form.elements){if(!el.name)continue;const label=([...el.closest('label').childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim()||el.name);const variant=/^variant-(\d)-/.exec(el.name);result.push([(variant?'Variant '+variant[1]+' / ':'')+label,el.type==='checkbox'?(el.checked?'Checked':'Not checked'):(el.value.trim()||'[Unanswered]')]);}const r=refresh();result.push(['Calculation status',r.valid?'Valid inputs':r.error]);if(r.valid){result.push(['First-order contribution before acquisition',money(r.contribution)],['Acquisition allowance before zero floor',money(r.allowance)],['Maximum new-customer CAC',money(r.maxCAC)],['Maximum CPC at entered new-customer CVR',r.maxCPC===null?'[No CVR entered]':money(r.maxCPC)])}return result}
function download(ext){
 const data=rows();const notes='Illustrative default costs require replacement with store data. All money inputs are per new-customer first order in the selected currency. Net sales already deduct refunds. Additional return costs exclude those refunds and any costs counted elsewhere. Fixed overhead, future purchases and production fees are excluded from the calculator; review production and agency fees separately in the test P&L. Attributed customers do not establish incrementality.';
 const safe=v=>{const s=String(v);return '"'+(/^[=+\-@\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"'};
 const text=ext==='csv'?'\ufeff'+[['Field','Value'],...data,['Method notes',notes]].map(row=>row.map(safe).join(',')).join('\r\n'):'# RISE ChatGPT Ads Test Plan\n\n'+data.map(([label,value])=>'## '+label+'\n\n'+value).join('\n\n')+'\n\n## Method notes\n\n'+notes+'\n\nResearch guide: https://resources.risedtc.com/guides/chatgpt-ads/\n';
 const url=URL.createObjectURL(new Blob([text],{type:ext==='csv'?'text/csv;charset=utf-8':'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='rise-chatgpt-ads-test-plan.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('download-status').textContent='Your '+ext.toUpperCase()+' download is ready. Keep a copy before closing this tab.';
}
document.getElementById('download-md').addEventListener('click',()=>download('md'));document.getElementById('download-csv').addEventListener('click',()=>download('csv'));
document.getElementById('print-plan').addEventListener('click',()=>{const details=[...document.querySelectorAll('details')];const prior=details.map(d=>d.open);details.forEach(d=>d.open=true);const areas=[...form.querySelectorAll('textarea')];const heights=areas.map(a=>a.style.height);areas.forEach(a=>a.style.height=a.scrollHeight+'px');window.print();details.forEach((d,i)=>d.open=prior[i]);areas.forEach((a,i)=>a.style.height=heights[i])});
