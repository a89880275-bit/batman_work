// Fictional demo requests only. This batch is applied once per browser storage.
const SAMPLE_REQUEST_BATCH='oncare-extra-160-v1';
const SAMPLE_REQUEST_COUNTS=[{type:0,count:100},{type:2,count:30},{type:1,count:20},{type:3,count:10}];
function generateSampleRequests(existing,guides,anchor=Date.now()){
 const departments=[
  {name:'외래간호팀',places:['외래 1층 103 진료실','외래 2층 간호사실','외래 3층 처치실']},
  {name:'원무팀',places:['본관 1층 접수창구','본관 1층 수납창구','입원 수속 창구']},
  {name:'병동간호팀',places:['본관 5층 간호사실','본관 6층 간호사실','별관 3층 병동']},
  {name:'진단검사의학팀',places:['본관 3층 채혈실','검체 접수실','검사실 사무공간']},
  {name:'영상의학팀',places:['지하 1층 영상 접수실','영상 판독실','촬영실 지원 데스크']},
  {name:'응급의료팀',places:['응급실 간호사실','응급실 접수대','응급실 지원 공간']}
 ];
 const codes=['PC','MON','PRN','LBL'],hour=3600000;
 const iso=t=>new Date(t).toISOString();
 const taken=new Set(existing.map(r=>r.id)),keys=new Set(existing.map(r=>r.sampleKey).filter(Boolean));
 let sequence=Math.max(128,...existing.map(r=>Number(String(r.id).split('-').at(-1))||0)),serial=0,added=[];
 const year=new Date(anchor).getUTCFullYear();
 for(const group of SAMPLE_REQUEST_COUNTS){
  const available=guides.filter(g=>g.type===group.type);
  if(!available.length)throw Error('지원 장비의 샘플 가이드가 없습니다.');
  for(let i=0;i<group.count;i++,serial++){
   const sampleKey=`${SAMPLE_REQUEST_BATCH}:${group.type}:${i}`;if(keys.has(sampleKey))continue;
   const g=available[i%available.length],dept=departments[(serial+group.type)%departments.length];
   const status=i<group.count*.6?'완료':i<group.count*.8?'처리 중':'접수';
   const duration=.5+((serial*7)%40)/2,age=status==='완료'?duration+2+((serial*23)%700):.3+((serial*17)%150);
   const created=anchor-age*hour,start=created+(status==='완료'?Math.min(duration/4,1):Math.min(age/3,2))*hour;
   const completed=status==='완료'?created+duration*hour:null;
   const assignee=status==='접수'?null:serial%2?'이전산':'김전산',urgent=serial%13===0;
   let id;do{id=`IT-${year}-${String(++sequence).padStart(4,'0')}`;}while(taken.has(id));taken.add(id);
   let brand=group.type===0?(i%4===3?'HP':'삼성'):group.type===2?'삼성':'제조사 모름';
   let model=group.type===0&&brand==='삼성'?['DB400TFA','DB400TEA','DB400T9B','DB400S6B','DB400S9B'][i%5]:'모델 모름';
   const resolution=group.type===0?(g.title.includes('전원')?'전원 케이블과 멀티탭 연결 점검 후 정상 부팅을 확인했습니다.':g.title.includes('키보드')?'USB 연결 점검 및 입력장치 교체 후 정상 작동을 확인했습니다.':'시작 프로그램과 저장장치 상태를 점검하고 재시작 후 정상 동작을 확인했습니다.'):group.type===1?'영상 케이블과 입력 소스를 점검하고 화면이 정상 출력되는 것을 확인했습니다.':group.type===2?(g.title.includes('용지')?'장비 사용자 안내에 따라 걸린 용지를 제거하고 정상 출력을 확인했습니다.':'출력 대기열과 프린터 연결 상태를 점검하고 정상 출력을 확인했습니다.'):'라벨 용지와 리본 장착 상태를 점검하고 비식별 시험 라벨의 출력 위치·인식을 확인했습니다.';
   const events=[{text:'시연용 장애가 접수되었습니다.',at:iso(created)}];
   if(assignee){events.push({text:`담당자가 ${assignee}님으로 지정되었습니다.`,at:iso(created+Math.min(age/8,.1)*hour)});events.push({text:`${assignee}: 처리를 시작했습니다.`,at:iso(start)});}
   if(completed)events.push({text:`${assignee}: 처리를 완료했습니다.`,at:iso(completed)});
   added.push({id,title:g.title,type:group.type,dept:dept.name,location:dept.places[i%dept.places.length],status,assignee,urgent,created:iso(created),completed:completed?iso(completed):null,name:`시연직원${String((serial%24)+1).padStart(2,'0')}`,user:`DEMO${String(serial+1).padStart(4,'0')}`,phone:`내선 ${2000+serial}`,asset:`${codes[group.type]}-DEMO-${String(i+1).padStart(3,'0')}`,brand,model,description:'화면과 통계 확인을 위해 생성한 가상 장애 신청입니다.',reason:urgent?(group.type===2||group.type===3?'주요 업무 중단':'진료 중단'):'',history:[],images:[],events,resolution:completed?resolution:'',sampleBatch:SAMPLE_REQUEST_BATCH,sampleKey});
  }
 }
 return added;
}
function installSampleRequests(state,guides,anchor=Date.now()){
 if(state.sampleDataBatches?.[SAMPLE_REQUEST_BATCH])return {added:0};
 const rows=generateSampleRequests(state.requests,guides,anchor);
 const next={...state,requests:[...state.requests,...rows].sort((a,b)=>new Date(b.created)-new Date(a.created)),sampleDataBatches:{...(state.sampleDataBatches||{}),[SAMPLE_REQUEST_BATCH]:{installedAt:new Date(anchor).toISOString(),count:160}}};
 Object.assign(state,next);
 try{localStorage.setItem('oncare-v1',JSON.stringify(state));return {added:rows.length};}catch{return {added:rows.length,storageError:true};}
}
