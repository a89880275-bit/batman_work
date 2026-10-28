// Explicit, once-only fictional demonstration batch for 2026-10-22 (KST).
function buildTodayDemo(source,guides,anchor=Date.now()){
 const day='2026-10-22',batch='today-demo-'+day+'-v1';
 if(source.sampleDataBatches?.[batch])return {state:source,added:0};
 const next=JSON.parse(JSON.stringify(source)),start=Date.parse(day+'T00:00:00+09:00');
 const end=Math.max(start,Math.min(Number(anchor),start+86400000-1));
 const at=f=>new Date(start+(end-start)*f).toISOString();
 const departments=[['외래간호팀','김간호','N1024'],['원무팀','시연직원 A','SIM-A'],['병동간호팀','시연직원 B','SIM-B'],['진단검사의학과','시연직원 C','SIM-C'],['응급의료팀','시연직원 D','SIM-D']];
 let sequence=Math.max(0,...next.requests.map(r=>Number(String(r.id).split('-').at(-1))||0));
 for(let i=0;i<15;i++){
  const type=i%4,g=guides.find(g=>g.type===type);if(!g)throw Error('시연 가이드가 없습니다.');
  const [dept,name,user]=departments[i%5],status=i<6?'접수':i<10?'처리 중':'완료',actor=i%2?'이전산':'김전산';
  const created=at(.25+i*.025),accepted=at(.27+i*.025),completed=status==='완료'?at(.30+i*.025):null;
  const events=[{at:created,text:'[가상 데이터] 오늘 장애 신청 접수'}];
  if(status!=='접수')events.push({at:accepted,text:actor+': 처리 시작'});
  if(completed)events.push({at:completed,text:actor+': 처리 완료'});
  next.requests.push({id:'IT-2026-'+String(++sequence).padStart(4,'0'),title:g.title,type,dept,location:dept+' 시연 업무 공간',status,assignee:status==='접수'?null:actor,urgent:i===0,created,completed,name,user,phone:'시연 내선 '+(3100+i),asset:'TODAY-DEMO-'+(i+1),brand:type===0||type===2?'삼성':'제조사 모름',model:type===0?'DB400TFA':'모델 모름',description:'[가상 데이터] 2026-10-22 신청현황 시연용',reason:i===0?'진료 중단':'',history:[],images:[],events,resolution:completed?'[가상 데이터] 장비 연결 상태 점검 후 정상 동작 확인':'',sampleBatch:batch,sampleKey:batch+':IT:'+i});
 }
 const items=next.toner.items.filter(i=>i.demo);if(!items.length)throw Error('시연 토너 품목이 없습니다.');
 const totals=new Map();
 for(let i=0;i<15;i++){
  const item=items[i%items.length],[dept,name,userId]=departments[i%5],status=i<5?'신청':i<9?'접수':'완료',actor=i%2?'이전산':'김전산',quantity=1+i%2;
  const id='TN-TODAY-20261022-'+String(i+1).padStart(3,'0');
  const createdAt=at(.3+i*.025),acceptedAt=status==='신청'?null:at(.32+i*.025),completedAt=status==='완료'?at(.35+i*.025):null;
  const events=[{at:createdAt,actor:name,text:'[가상 데이터] 토너 신청 · '+quantity+'개 예약'}];
  if(acceptedAt)events.push({at:acceptedAt,actor,text:'[가상 데이터] 접수 · 수령 대기'});
  if(completedAt)events.push({at:completedAt,actor,text:'[가상 데이터] 수령 완료 · '+quantity+'개 출고'});
  next.toner.requests.push({id,itemId:item.id,code:item.code,itemName:item.name,color:item.color,printerModel:item.printerModels[0],quantity,dept,name,userId,phone:'시연 내선 '+(3200+i),location:dept+' 시연 업무 공간',note:'[가상 데이터] 2026-10-22 오늘 신청현황 시연',status,createdAt,acceptedAt,acceptedBy:acceptedAt?actor:null,completedAt,completedBy:completedAt?actor:null,receiver:completedAt?name:null,sampleBatch:batch,demo:true,events});
  if(completedAt)next.toner.movements.push({id:'TODAY-OUT-'+id,itemId:item.id,kind:'출고',quantity,at:completedAt,actor,requestId:id,note:'[가상 데이터] 오늘 시연 수령',sampleBatch:batch});
  totals.set(item.id,(totals.get(item.id)||0)+quantity);
 }
 // Fund completed and reserved demo quantities together: available stock is unchanged.
 for(const [itemId,quantity]of totals)next.toner.movements.push({id:'TODAY-IN-20261022-'+itemId,itemId,kind:'입고',quantity,at:at(.1),actor:'김전산',note:'[가상 데이터] 오늘 시연 전용 입고',sampleBatch:batch});
 next.toner.revision=(next.toner.revision||0)+1;
 next.sampleDataBatches={...next.sampleDataBatches,[batch]:{day,installedAt:new Date(anchor).toISOString(),hardware:{접수:6,'처리 중':4,완료:5},toner:{신청:5,접수:4,완료:6},count:30}};
 return {state:next,added:30};
}
function installTodayDemo(state,guides){
 try{const result=buildTodayDemo(state,guides);if(result.added){localStorage.setItem('oncare-v1',JSON.stringify(result.state));Object.assign(state,result.state);}return {added:result.added};}
 catch(error){return {added:0,storageError:true,error:error.message};}
}
