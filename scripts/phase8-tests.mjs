import assert from 'node:assert/strict';
function pct(p,t){return t<=0?0:Number(((p/t)*100).toFixed(2));}
function overall(records){const p=records.filter(x=>x==='p').length;return {present:p,total:records.length,percentage:pct(p,records.length)};}
function status(p,r){const risk=5;return p<r?'BELOW_REQUIRED':p<r+risk?'AT_RISK':'SAFE';}
function projection(p,a,r){if(r<=0)return 0;if(r>=100)return null;const t=p+a;if(pct(p,t)>=r)return 0;return Math.max(0,Math.ceil((r*t/100-p)/((100-r)/100)));}
assert.equal(pct(0,0),0); assert.equal(pct(16,20),80); assert.equal(pct(18,22),81.82);
assert.deepEqual(overall(['p','p','p','a','a']),{present:3,total:5,percentage:60});
assert.equal(status(82,75),'SAFE'); assert.equal(status(76,75),'AT_RISK'); assert.equal(status(68,75),'BELOW_REQUIRED');
assert.equal(projection(6,4,75),6); assert.equal(projection(8,2,75),0); assert.equal(projection(1,9,100),null);
function due(statusValue,due,now){if(statusValue==='COMPLETED')return 'COMPLETED';const a=new Date(due);const b=new Date(now);a.setHours(0,0,0,0);b.setHours(0,0,0,0);const d=Math.round((a-b)/86400000);return d<0?'OVERDUE':d===0?'DUE_TODAY':d<=2?'DUE_SOON':'UPCOMING';}
assert.equal(due('PENDING','2026-09-08T10:00:00','2026-09-09T12:00:00'),'OVERDUE'); assert.equal(due('PENDING','2026-09-09T10:00:00','2026-09-09T12:00:00'),'DUE_TODAY'); assert.equal(due('COMPLETED','2026-09-01T10:00:00','2026-09-09T12:00:00'),'COMPLETED');
function experimentProgress(items){const total=items.length,completed=items.filter(x=>x==='c').length,checked=items.filter(x=>x==='k').length;return{completion:total?completed/total*100:0,checked:total?checked/total*100:0};}
assert.equal(experimentProgress(['c','c','p','k']).completion,50); assert.equal(experimentProgress([]).completion,0);
function localKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function streak(records,today){const set=new Set(records);const [y,m,day]=today.split('-').map(Number);const d=new Date(y,m-1,day);let n=0;while(set.has(localKey(d))){n++;d.setDate(d.getDate()-1);}return n;}
assert.equal(streak(['2026-09-09','2026-09-08','2026-09-07'],'2026-09-09'),3); assert.equal(streak(['2026-09-09','2026-09-07'],'2026-09-09'),1);
console.log('PASS attendance calculation tests'); console.log('PASS assignment due-state tests'); console.log('PASS experiment progress tests'); console.log('PASS habit streak tests'); console.log('Phase 8 runtime business-logic tests: PASS');
