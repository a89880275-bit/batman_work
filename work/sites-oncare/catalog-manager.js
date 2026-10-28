let catalogType='0';
function brandsFor(type){return [...new Set([...(deviceBrands[type]||[]),...Object.keys(data.catalog?.[type]||{})])];}
function catalogKey(value){return String(value||'').trim().normalize('NFKC').toLocaleLowerCase();}
function catalogRegister(base,op,isAdmin){
 if(!isAdmin)throw Error('전산 담당자만 등록할 수 있습니다.');
 if(!['0','1','2','3'].includes(String(op.type)))throw Error('장비 종류를 선택해주세요.');
 const t=String(op.type),b=String(op.brand||'').trim().normalize('NFKC'),m=String(op.model||'').trim().normalize('NFKC');
 if(!b||b.length>80||['__proto__','constructor','prototype','custom','unknown','제조사 모름'].includes(catalogKey(b)))throw Error('올바른 제조사명을 80자 이내로 입력해주세요.');
 const out=JSON.parse(JSON.stringify(base||{}));
 const brands=[...(deviceBrands[t]||[]),...Object.keys(out[t]||{})],existing=brands.find(x=>catalogKey(x)===catalogKey(b));
 if(op.kind==='brand'){
  if(existing)throw Error('이 장비에 이미 등록된 제조사입니다.');
  out[t]||={};out[t][b]=[];
 }else if(op.kind==='model'){
  if(!existing)throw Error('제조사를 먼저 등록해주세요.');
  if(!m||m.length>100||['custom','unknown','모델 모름'].includes(catalogKey(m)))throw Error('올바른 모델번호를 100자 이내로 입력해주세요.');
  const models=[...(defaultModels[t]?.[existing]||[]),...(out[t]?.[existing]||[])];
  if(models.some(x=>catalogKey(x)===catalogKey(m)))throw Error('이 제조사에 이미 등록된 모델번호입니다.');
  out[t]||={};out[t][existing]||=[];out[t][existing].push(m);
 }else throw Error('지원하지 않는 등록 작업입니다.');
 return out;
}
function catalog(){
 if(!admin())return '';
 const brands=brandsFor(catalogType),count=brands.reduce((n,b)=>n+modelsFor(catalogType,b).length,0);
 return heading('장비 제조사·모델 관리','장비별 제조사를 등록한 뒤, 해당 제조사의 모델번호를 추가하세요.',`<div class="catalog-actions"><button class="btn" data-catalog-action="brand">${icon('plus')}제조사 등록</button><button class="btn primary" data-catalog-action="model">${icon('plus')}모델 등록</button></div>`)+`<div class="catalog-types" role="group" aria-label="관리할 장비 종류">${types.map((t,i)=>`<button class="btn ${catalogType===String(i)?'primary':''}" data-catalog-type="${i}" aria-pressed="${catalogType===String(i)}">${icon(typeicons[i])}${esc(t)}</button>`).join('')}</div><div class="notice">등록한 제조사와 모델은 직원의 장비 선택·긴급 장애 접수 화면에 바로 표시됩니다. 기존 삼성·HP 제조사 및 삼성 PC 모델도 유지됩니다.</div><section class="panel"><div class="panelhead"><h2>${esc(types[Number(catalogType)])} 등록 현황</h2><span class="textbtn">제조사 ${brands.length}개 · 모델 ${count}개</span></div><div class="catalog-grid">${brands.map(b=>{const models=modelsFor(catalogType,b);return `<article class="catalog-card"><div class="catalog-brand-head"><div><strong>${esc(b)}</strong><small>모델 ${models.length}개</small></div><button class="btn" data-catalog-brand="${esc(b)}">모델 추가</button></div><div class="catalog-models">${models.length?models.map(m=>`<span>${esc(m)}</span>`).join(''):'<p class="sectionnote">등록된 모델이 없습니다. 모델번호를 추가해주세요.</p>'}</div></article>`;}).join('')||'<div class="empty">아직 등록된 제조사가 없습니다. 제조사를 먼저 등록해주세요.</div>'}</div></section><p class="sectionnote">실제 모델번호는 장비 라벨을 확인해 등록해주세요. 현재 시연 데이터는 이 브라우저에 저장됩니다.</p>`;
}
function bindCatalog(){
 document.querySelectorAll('[data-catalog-type]').forEach(b=>b.onclick=()=>{catalogType=b.dataset.catalogType;render();});
 document.querySelectorAll('[data-catalog-action]').forEach(b=>b.onclick=()=>catalogForm(b.dataset.catalogAction));
 document.querySelectorAll('[data-catalog-brand]').forEach(b=>b.onclick=()=>catalogForm('model',b.dataset.catalogBrand));
}
function catalogForm(kind,selectedBrand=''){
 if(!admin())return;const isBrand=kind==='brand';
 modal(isBrand?'제조사 등록':'모델번호 등록',`<div class="notice warm" id="catalog-error" role="alert" tabindex="-1" hidden></div><form id="catalog-form" class="formgrid"><div><label for="cm-type">장비 종류 *</label><select id="cm-type">${types.map((t,i)=>`<option value="${i}" ${catalogType===String(i)?'selected':''}>${esc(t)}</option>`).join('')}</select></div><div><label for="cm-brand">제조사 *</label>${isBrand?'<input id="cm-brand" required maxlength="80" placeholder="예: 삼성, HP, LG">':'<select id="cm-brand" required></select>'}</div>${isBrand?'':`<div class="full"><label for="cm-model">모델번호 *</label><input id="cm-model" required maxlength="100" placeholder="장비 라벨의 정확한 모델번호"></div><div class="full notice" id="cm-existing" aria-live="polite"></div>`}</form><p class="helper">${isBrand?'같은 제조사는 장비 종류별로 각각 등록할 수 있습니다. 등록 후 모델번호를 추가하세요.':'선택한 장비·제조사에 모델을 등록합니다. 새 제조사는 ‘제조사 등록’에서 먼저 추가해주세요.'}</p>`,`<button class="btn primary" id="cm-save">${isBrand?'제조사 저장':'모델 저장'}</button>`);
 const t=$('#cm-type'),b=$('#cm-brand');
 if(!isBrand){
  function list(){const models=modelsFor(t.value,b.value);$('#cm-existing').textContent=b.value?'현재 모델: '+(models.length?models.join(' · '):'등록 없음'):(brandsFor(t.value).length?'제조사를 선택하면 현재 등록된 모델을 확인할 수 있습니다.':'이 장비의 제조사가 없습니다. 제조사를 먼저 등록해주세요.');$('#cm-save').disabled=!b.value;}
  function change(){const brands=brandsFor(t.value);b.innerHTML='<option value="">제조사 선택</option>'+brands.map(v=>`<option>${esc(v)}</option>`).join('');if(brands.includes(selectedBrand))b.value=selectedBrand;else if(brands.length===1)b.value=brands[0];list();}t.onchange=change;b.onchange=list;change();
 }
 $('#cm-save').onclick=()=>{
  if(!$('#catalog-form').reportValidity())return;
  try{
   // Use the latest saved state so registration preserves concurrent toner/helpdesk changes.
   const stored=localStorage.getItem('oncare-v1'),latest=stored?JSON.parse(stored):data;if(!latest||!Array.isArray(latest.requests))throw Error('저장 데이터를 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.');
   const next={...latest,catalog:catalogRegister(latest.catalog,{kind,type:t.value,brand:b.value,model:isBrand?'':$('#cm-model').value},admin())};
   localStorage.setItem('oncare-v1',JSON.stringify(next));data=next;catalogType=t.value;close();render();toast(isBrand?'제조사를 등록했습니다. 모델번호를 추가할 수 있습니다.':'모델을 직원 선택 목록에 등록했습니다.');
  }catch(e){const error=$('#catalog-error');error.hidden=false;error.textContent=e.name==='QuotaExceededError'?'저장 공간이 부족합니다. 브라우저 저장 공간을 확인해주세요.':e.message;error.focus();}
 };
 $('#catalog-form').onsubmit=e=>{e.preventDefault();$('#cm-save').click();};
}
