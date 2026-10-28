// The hospital's confirmed model numbers can be registered by IT staff.
const deviceBrands={0:['삼성','HP'],2:['삼성']};
const defaultModels={0:{'삼성':['DB400TFA','DB400TEA','DB400T9B','DB400S6B','DB400S9B']}};
function modelFamily(model){let key=String(model).trim().toUpperCase().split('-')[0];return /^DB400S/.test(key)?{label:'슬림형 (Slim) — DB400S 시리즈',description:'두께가 얇아 사무 공간을 효율적으로 활용할 수 있는 본체입니다.'}:/^DB400T/.test(key)?{label:'타워형 (Tower) — DB400T 시리즈',description:'일반 타워형 데스크탑 본체입니다.'}:null;}
function modelOptions(models,type,brand){
 const option=m=>`<option value="${esc(m)}">${esc(m)}</option>`;
 if(Number(type)!==0||brand!=='삼성')return models.map(option).join('');
 const tower=models.filter(m=>/^DB400T/i.test(m)),slim=models.filter(m=>/^DB400S/i.test(m)),others=models.filter(m=>!/^DB400[TS]/i.test(m));
 return [[tower,'타워형 (Tower) · DB400T 시리즈'],[slim,'슬림형 (Slim) · DB400S 시리즈'],[others,'기타 모델']].filter(([list])=>list.length).map(([list,label])=>`<optgroup label="${label}">${list.map(option).join('')}</optgroup>`).join('');
}
function ensureCatalog(){if(!data.catalog)data.catalog={};}
function modelsFor(type,brand){return [...new Set([...(Object.hasOwn(defaultModels[String(type)]||{},brand)?defaultModels[String(type)][brand]:[]),...(Object.hasOwn(data.catalog?.[String(type)]||{},brand)?data.catalog[String(type)][brand]:[])])];}
function deviceLabel(d){return [d.brand,d.model].filter(Boolean).join(' · ')||'제조사·모델 미입력';}
function modelPreview(type,brand,model){
 if(!model)return '<div class="model-empty">모델을 선택하면 제품 이미지를 확인할 수 있습니다.</div>';
 let key=String(model).trim().toUpperCase().split('-')[0],item=Number(type)===0&&brand==='삼성'?MODEL_IMAGES[key]:null;
 if(!item)return '<div class="model-empty">'+esc(model==='모델 모름'?'모델 확인이 어려워도 접수할 수 있습니다.':'이 모델은 아직 등록된 이미지가 없습니다.')+'</div>';
 let family=modelFamily(model);
 return `<figure class="model-preview"><div class="model-photo"><img src="${item.src}" alt="삼성 ${esc(key)} 데스크탑 제품 이미지"></div><figcaption><span class="model-kicker">SAMSUNG DESKTOP</span><strong>${esc(model)}</strong>${family?`<span class="model-family">${esc(family.label)}</span><p>${esc(family.description)}</p>`:''}<p>장비 라벨의 모델명과 함께 확인해주세요.<br>세부 구성에 따라 외관이 다를 수 있습니다.</p><a href="${item.source}" target="_blank" rel="noopener noreferrer">이미지 출처: ${esc(item.credit)} ↗</a></figcaption></figure>`;
}
function deviceFields(type,prefix='device',selected={}){
 let brands=brandsFor(type),brand=selected.brand||'',known=brands.includes(brand),brandValue=brand?(known?brand:brand==='제조사 모름'?'unknown':'custom'):'';
 return `<div class="formgrid"><div><label for="${prefix}-brand">제조사 <span class="required">*</span></label><select id="${prefix}-brand" required><option value="">제조사를 선택해주세요</option>${brands.map(b=>`<option value="${esc(b)}" ${brandValue===b?'selected':''}>${esc(b)}</option>`).join('')}${!brands.length?`<option value="custom" ${brandValue==='custom'?'selected':''}>제조사 직접 입력</option>`:''}<option value="unknown" ${brandValue==='unknown'?'selected':''}>제조사 모름</option></select></div><div id="${prefix}-brand-entry" ${brandValue==='custom'?'':'hidden'}><label for="${prefix}-brand-text">제조사명</label><input id="${prefix}-brand-text" maxlength="80" value="${brandValue==='custom'?esc(brand):''}"></div><div><label for="${prefix}-model">모델 <span class="required">*</span></label><select id="${prefix}-model"></select></div><div class="full" id="${prefix}-model-entry" hidden><label for="${prefix}-model-text">모델명 <span class="required">*</span></label><input id="${prefix}-model-text" maxlength="100" placeholder="장비 라벨에 적힌 모델명을 입력해주세요" value="${esc(selected.model&&selected.model!=='모델 모름'?selected.model:'')}"></div><div class="full" id="${prefix}-preview" aria-live="polite"></div></div>`;
}
function bindDeviceFields(type,prefix='device',selected={}){
 let brand=$('#'+prefix+'-brand'),model=$('#'+prefix+'-model'),brandText=$('#'+prefix+'-brand-text');
 function updateModel(initial=false){let b=brand.value==='custom'?brandText.value.trim():brand.value==='unknown'?'제조사 모름':brand.value,models=modelsFor(type,b);model.innerHTML='<option value="">모델을 선택해주세요</option>'+modelOptions(models,type,b)+'<option value="custom">모델 직접 입력</option><option value="unknown">모델 모름</option>';model.disabled=!b;if(initial&&selected.model)model.value=models.includes(selected.model)?selected.model:selected.model==='모델 모름'?'unknown':'custom';else model.value='';updateEntry();}
 function updateEntry(){$('#'+prefix+'-model-entry').hidden=model.value!=='custom';$('#'+prefix+'-model-text').required=model.value==='custom';let b=brand.value==='custom'?brandText.value.trim():brand.value,m=model.value==='custom'?$('#'+prefix+'-model-text').value.trim():model.value==='unknown'?'모델 모름':model.value;$('#'+prefix+'-preview').innerHTML=modelPreview(type,b,m);}
 brand.onchange=()=>{$('#'+prefix+'-brand-entry').hidden=brand.value!=='custom';brandText.required=brand.value==='custom';updateModel();};brandText.oninput=()=>updateModel();model.onchange=updateEntry;$('#'+prefix+'-model-text').oninput=updateEntry;updateModel(true);
 return ()=>{let b=brand.value==='custom'?brandText.value.trim():brand.value==='unknown'?'제조사 모름':brand.value,m=model.value==='custom'?$('#'+prefix+'-model-text').value.trim():model.value==='unknown'?'모델 모름':model.value;if(!b||!m){toast('제조사와 모델을 선택해주세요. 모르면 ‘모름’을 선택할 수 있습니다.');return null}return {brand:b,model:m};};
}
function selectDevice(type,onContinue,selected={}){
 modal(`${types[type]} · 제조사와 모델 선택`,`<div class="stepnum">장비 선택 → 제조사·모델 → 증상 선택</div><p class="subtitle" style="margin-bottom:20px">장비에 부착된 라벨에서 제조사와 모델명을 확인해주세요.</p><form id="deviceform">${deviceFields(type,'device',selected)}</form><div class="notice">등록된 모델은 목록에서 선택할 수 있습니다. 목록에 없으면 직접 입력하고, 확인이 어려우면 ‘모델 모름’을 선택하세요.<br>현재 안내는 장비 공통 조치입니다. 선택 정보는 접수 시 전산 담당자에게 전달됩니다.</div>`,`<button class="btn primary" id="devicecontinue">다음: 증상 확인 ${icon('arrow')}</button>`);
 let read=bindDeviceFields(type,'device',selected);$('#devicecontinue').onclick=()=>{if(!$('#deviceform').reportValidity())return;let d=read();if(d)onContinue(d)};
}
function manageModels(){if(admin())nav('catalog');}
