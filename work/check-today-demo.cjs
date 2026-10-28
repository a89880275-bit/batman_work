const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});
vm.runInContext(fs.readFileSync('work/sites-oncare/toner.js','utf8')+'\nthis.testToner=Toner;',ctx);
vm.runInContext(fs.readFileSync('work/sites-oncare/today-demo.js','utf8'),ctx);
const original={requests:[{id:'IT-2026-0320',created:'2026-10-20T00:00:00Z'}],toner:ctx.testToner.create()};
const before=JSON.stringify(original),anchor=Date.parse('2026-10-22T04:00:00Z');
const result=ctx.buildTodayDemo(original,[0,1,2,3].map(type=>({type,title:'test-'+type})),anchor);
assert.equal(result.added,30);assert.equal(JSON.stringify(original),before);
const next=result.state,rows=next.requests.slice(1),toner=next.toner.requests.filter(r=>r.sampleBatch?.startsWith('today-demo-'));
for(const [status,count]of Object.entries({'접수':6,'처리 중':4,'완료':5}))assert.equal(rows.filter(r=>r.status===status).length,count);
for(const [status,count]of Object.entries({'신청':5,'접수':4,'완료':6}))assert.equal(toner.filter(r=>r.status===status).length,count);
for(const r of [...rows,...toner]){const t=Date.parse(r.created||r.createdAt);assert(t>=Date.parse('2026-10-22T00:00:00+09:00')&&t<=anchor);}
for(const item of original.toner.items)assert.equal(ctx.testToner.stock(next.toner,item.id).available,ctx.testToner.stock(original.toner,item.id).available);
for(const r of toner.filter(r=>r.status==='완료'))assert.equal(next.toner.movements.filter(m=>m.requestId===r.id).length,1);
assert.equal(new Set(next.requests.map(r=>r.id)).size,next.requests.length);
assert.equal(ctx.buildTodayDemo(next,[],anchor).added,0);
console.log('PASS: 30 dated records, status counts, original data preserved, available stock unchanged, completed outflows and idempotence');
