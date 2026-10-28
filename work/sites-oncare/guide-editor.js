function stepPicture(image,alt='조치 방법 참고 이미지'){
 if(!image||!/^data:image\/(png|jpeg|webp|svg\+xml);base64,/i.test(image.url||''))return '';
 return `<figure class="step-picture"><img src="${image.url}" alt="${esc(image.caption||alt)}">${image.caption?`<figcaption>${esc(image.caption)}</figcaption>`:''}</figure>`;
}
function guideHistoryMarkup(history){return history.map((h,i)=>`<section class="guide-history-step"><b>STEP ${i+1}</b><p>${esc(h.step)}</p>${stepPicture(h.image,`조치 ${i+1} 참고 이미지`)}<strong>→ ${esc(h.answer)}</strong></section>`).join('');}
function readStepImage(file){return new Promise((resolve,reject)=>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(Error('JPG·PNG·WebP 이미지만 등록할 수 있습니다.'));
 if(file.size>2*1024*1024)return reject(Error('이미지는 단계당 1장, 2MB 이하로 등록해주세요.'));
 let reader=new FileReader();reader.onerror=()=>reject(Error('파일을 읽지 못했습니다. 다시 선택해주세요.'));
 reader.onload=()=>{let img=new Image();img.onload=()=>resolve({url:reader.result,name:file.name,caption:''});img.onerror=()=>reject(Error('올바른 이미지 파일인지 확인해주세요.'));img.src=reader.result;};reader.readAsDataURL(file);
});}
function editGuide(id){
 if(!admin())return;
 let g=id?data.guides.find(x=>x.id===id):null;if(id&&!g)return;
 let steps=(g?.steps||['','']).map((text,i)=>({key:crypto.randomUUID(),text,image:g?.stepImages?.[i]?{...g.stepImages[i]}:null})),busy=false;
 modal(id?'조치 단계 관리':'해결 가이드 추가',`<form id="guideform"><div id="guideeditor"><div class="formgrid"><div><label for="gtype">장비</label><select id="gtype">${types.map((t,i)=>`<option value="${i}" ${g?.type===i?'selected':''}>${t}</option>`).join('')}</select></div><div><label for="gtitle">증상 이름 <span class="required">*</span></label><input id="gtitle" required maxlength="120" value="${esc(g?.title||'')}" placeholder="예: 전원이 켜지지 않아요"></div></div><div class="notice">조치마다 설명과 참고 이미지를 등록하세요. 이미지 없이 설명만 제공할 수도 있습니다.<br>이미지: 단계당 1장 · JPG·PNG·WebP · 최대 2MB. 환자정보가 포함되지 않은 사진을 사용해주세요.</div><div id="stepcards"></div><button type="button" class="btn" id="addstep">${icon('plus')}조치 단계 추가</button><div class="notice">각 단계는 해결 / 미해결 / 수행 불가로 연결됩니다. 마지막 미해결 단계에서 전산 접수를 안내합니다. 저장하면 새 안내부터 적용되며 기존 접수 이력은 유지됩니다.</div><section id="guidepreview" hidden></section></div></form>`,`<span id="guideuploadstatus" class="subtitle" role="status"></span><button class="btn" id="previewguide">직원 화면 미리보기</button><button class="btn primary" id="saveguide">저장 및 적용</button>`);
 let editor=$('#guideeditor');
 function connected(){return $('#guideeditor')===editor;}
 function setBusy(value){busy=value;if(!connected())return;$('#saveguide').disabled=value;$('#previewguide').disabled=value;editor.querySelectorAll('button,input[type=file]').forEach(b=>{if(value){b.dataset.beforeBusy=String(b.disabled);b.disabled=true;}else if('beforeBusy' in b.dataset){b.disabled=b.dataset.beforeBusy==='true';delete b.dataset.beforeBusy;}});$('#guideuploadstatus').textContent=value?'이미지를 확인하고 있습니다…':'';}
 function invalidatePreview(){if($('#guidepreview'))$('#guidepreview').hidden=true;}
 function draw(){
  $('#stepcards').innerHTML=steps.map((s,i)=>`<section class="step-editor-card" data-step-key="${s.key}"><div class="step-editor-head"><div><span class="step-editor-number">${String(i+1).padStart(2,'0')}</span><h3>조치 단계 ${i+1}</h3></div><div class="step-controls"><button type="button" class="btn compact" data-move="up" ${i===0?'disabled':''} aria-label="조치 ${i+1} 위로 이동">↑</button><button type="button" class="btn compact" data-move="down" ${i===steps.length-1?'disabled':''} aria-label="조치 ${i+1} 아래로 이동">↓</button><button type="button" class="btn compact danger" data-delete ${steps.length===1?'disabled':''}>단계 삭제</button></div></div><label for="steptext-${s.key}">조치 설명 <span class="required">*</span></label><textarea id="steptext-${s.key}" data-text required maxlength="3000" placeholder="직원이 수행할 조치 방법을 입력해주세요">${esc(s.text)}</textarea><div class="step-upload"><label for="stepfile-${s.key}">조치 ${i+1} 참고 이미지 ${s.image?'교체':'등록'}</label><input id="stepfile-${s.key}" data-file type="file" accept="image/jpeg,image/png,image/webp">${s.image?`<div class="step-image-info"><span>${esc(s.image.name||'등록된 이미지')}</span><button type="button" class="textbtn remove-image" data-remove-image>이미지 삭제</button></div>${stepPicture(s.image,`조치 ${i+1} 참고 이미지`)}<label for="stepcaption-${s.key}">이미지 설명 <span class="subtitle">(선택)</span></label><input id="stepcaption-${s.key}" data-caption maxlength="200" placeholder="예: 본체 뒷면의 전원 케이블 연결 위치" value="${esc(s.image.caption||'')}">`:'<div class="step-no-image">등록된 이미지가 없습니다. 이 단계는 설명만 표시됩니다.</div>'}</div></section>`).join('');
  $('#stepcards').querySelectorAll('[data-step-key]').forEach((card,i)=>{
   let s=steps[i];card.querySelector('[data-text]').oninput=e=>{s.text=e.target.value;invalidatePreview()};
   card.querySelector('[data-file]').onchange=async e=>{let file=e.target.files?.[0];if(!file||busy)return;setBusy(true);try{let image=await readStepImage(file);if(!connected())return;s.image=image;invalidatePreview();draw();toast('이미지를 등록했습니다. 저장 및 적용을 눌러 반영해주세요.');}catch(err){if(connected()){toast(err.message);e.target.value='';}}finally{setBusy(false)}};
   if(card.querySelector('[data-caption]'))card.querySelector('[data-caption]').oninput=e=>{s.image.caption=e.target.value;invalidatePreview()};
   if(card.querySelector('[data-remove-image]'))card.querySelector('[data-remove-image]').onclick=()=>{if(busy)return;s.image=null;invalidatePreview();draw()};
   card.querySelector('[data-delete]').onclick=()=>{if(busy||steps.length===1)return;steps.splice(i,1);invalidatePreview();draw()};
   card.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{if(busy)return;let next=i+(b.dataset.move==='up'?-1:1);if(next<0||next>=steps.length)return;[steps[i],steps[next]]=[steps[next],steps[i]];invalidatePreview();draw()});
  });
 }
 $('#addstep').onclick=()=>{if(busy)return;if(steps.length>=20)return toast('조치 단계는 최대 20개까지 등록할 수 있습니다.');steps.push({key:crypto.randomUUID(),text:'',image:null});invalidatePreview();draw()};
 $('#previewguide').onclick=()=>{if(busy)return;if(!$('#guideform').reportValidity())return;let preview=$('#guidepreview');preview.innerHTML='<div class="panelhead"><h3>직원 화면 미리보기</h3><span class="trend">저장 전 미리보기</span></div>'+steps.map((s,i)=>`<section class="guide-preview-step"><div class="stepnum">STEP ${i+1} / ${steps.length}</div><p>${esc(s.text)}</p>${stepPicture(s.image,`조치 ${i+1} 참고 이미지`)}<div class="notice">해결 → 종료 / 미해결 → ${i===steps.length-1?'전산 접수':'다음 단계'} / 수행 불가 → 사유 입력 후 접수</div></section>`).join('');preview.hidden=false;preview.scrollIntoView({block:'start',behavior:'smooth'})};
 $('#saveguide').onclick=()=>{
  if(busy||!$('#guideform').reportValidity())return;let title=$('#gtitle').value.trim();if(!title||steps.some(s=>!s.text.trim()))return toast('증상 이름과 모든 조치 설명을 입력해주세요.');
  let record={...(g||{}),id:id||'g-'+crypto.randomUUID(),type:Number($('#gtype').value),title,steps:steps.map(s=>s.text.trim()),stepImages:steps.map(s=>s.image?{...s.image}:null),version:g?(g.version||1)+1:1};
  let next={...data,guides:id?data.guides.map(x=>x.id===id?record:x):[...data.guides,record]};
  try{localStorage.setItem('oncare-v1',JSON.stringify(next));data=next;close();render();toast('조치 설명과 이미지를 저장했습니다.');}catch{toast('브라우저 저장 공간이 부족합니다. 이미지 용량이나 개수를 줄여 다시 저장해주세요. 입력 내용은 유지됩니다.');}
 };
 draw();
}
