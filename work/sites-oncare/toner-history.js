/* One-time fictional history, matched receipts preserve the existing live stock. */
function buildTonerHistory(source,at=new Date().toISOString()){
 const batch='toner-six-months-v1';if(source.sampleBatches?.[batch])return {toner:source,added:0};
 const next=JSON.parse(JSON.stringify(source)),items=['demo-black','demo-color','demo-label'].map(id=>next.items.find(i=>i.id===id));
 if(items.some(i=>!i))throw Error('6개월 시연 이력을 위한 기본 토너 품목이 없습니다.');
 const [year,month]=Toner.month(at).split('-').map(Number),counts=[22,28,24,34,32,40],departments=[['외래간호팀','김간호','N1024'],['원무팀','가상직원 A','SIM-A'],['진단검사의학과','가상직원 B','SIM-B'],['병동간호팀','가상직원 C','SIM-C'],['응급의료팀','가상직원 D','SIM-D'],['영상의학과','가상직원 E','SIM-E']],months=[];
 for(let index=0;index<6;index++){
  const key=new Date(Date.UTC(year,month-1-(5-index),1,12)).toISOString().slice(0,7),start=new Date(key+'-01T00:00:00+09:00').getTime(),nextMonth=new Date(Date.UTC(Number(key.slice(0,4)),Number(key.slice(5)),1)).getTime()-9*3600000;
  const until=Math.min(nextMonth-1,new Date(at).getTime()),lag=Math.min(120000,Math.max(0,until-start)),lastCreated=Math.max(start,until-lag),totals=new Map();
  let usage=0;
  for(let j=0;j<counts[index];j++){
   const item=items[(j+index)%3],[dept,name,userId]=departments[j%departments.length],quantity=1+(j+index)%3,createdAt=new Date(start+(lastCreated-start)*(j+1)/(counts[index]+1)).toISOString(),acceptedAt=new Date(new Date(createdAt).getTime()+lag/2).toISOString(),completedAt=new Date(new Date(createdAt).getTime()+lag).toISOString(),id='TN-SIM6-'+key.replace('-','')+'-'+String(j+1).padStart(3,'0'),actor=j%2?'이전산':'김전산';
   const request={id,itemId:item.id,code:item.code,itemName:item.name,color:item.color,printerModel:item.printerModels[0],quantity,dept,name,userId,phone:'가상 내선 '+(1200+j%20),location:dept+' 시연 위치',note:'[가상 데이터] 6개월 월별 추이 확인용',status:'완료',createdAt,acceptedAt,acceptedBy:actor,completedAt,completedBy:actor,receiver:name,sampleBatch:batch,demo:true,events:[{at:createdAt,actor:name,text:'[가상] 토너 신청 · '+quantity+'개 예약'},{at:acceptedAt,actor,text:'[가상] 접수 · 수령 대기'},{at:completedAt,actor,text:'[가상] 수령 완료 · '+quantity+'개 출고'}]};
   next.requests.push(request);next.movements.push({id:'SIM6-OUT-'+id,itemId:item.id,kind:'출고',quantity,at:completedAt,actor,requestId:id,note:'[가상 데이터] '+dept+' 수령',sampleBatch:batch});totals.set(item.id,(totals.get(item.id)||0)+quantity);usage+=quantity;
  }
  for(const [itemId,quantity]of totals)next.movements.push({id:'SIM6-IN-'+key+'-'+itemId,itemId,kind:'입고',quantity,at:new Date(start).toISOString(),actor:'김전산',note:'[가상 데이터] '+key+' 월별 출고 대응 입고',sampleBatch:batch});
  months.push({month:key,requests:counts[index],quantity:usage});
 }
 next.sampleBatches={...next.sampleBatches,[batch]:{createdAt:at,requestCount:180,months}};next.revision=(next.revision||0)+1;
 return {toner:next,added:180,months};
}
function installTonerHistory(state){
 try{const result=buildTonerHistory(state.toner);if(!result.added)return result;const updated={...state,toner:result.toner};localStorage.setItem('oncare-v1',JSON.stringify(updated));state.toner=result.toner;return result;}catch(error){return {added:0,storageError:true,error:error.message};}
}
