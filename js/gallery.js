(() => {
'use strict';
const letters=window.VEC_LETTERS;
const $=id=>document.getElementById(id);
const date=l=>new Date(l.date).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'});
let selected=null,page=0,inspecting=false,loadToken=0,drag=null,rotation=0,fullWidth=0,fullHeight=0;
const previews=new Map();
function stopPreview(link){const state=previews.get(link);if(!state)return;clearInterval(state.timer);link.querySelector('img').src=state.first;previews.delete(link);}
function stopAll(){for(const link of [...previews.keys()])stopPreview(link);}
letters.forEach(letter=>{
 const link=document.createElement('a');link.className='art';link.href='#letter/'+letter.id;link.setAttribute('aria-label',`Letter ${letter.id}, ${date(letter)}`);
 link.innerHTML=`<div class="art-frame"><img src="${letter.images[0].preview}" alt="${date(letter)}, envelope front" loading="lazy" width="350" height="320"></div><div class="art-caption"><span>${date(letter)}</span><span>${letter.images.length} images</span></div>`;
 const start=()=>{if(previews.has(link))return;let frame=0;const first=letter.images[0].preview;const timer=setInterval(()=>{frame=(frame+1)%letter.images.length;link.querySelector('img').src=letter.images[frame].preview;},1000);previews.set(link,{first,timer});};
 link.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')start();});link.addEventListener('pointerleave',()=>stopPreview(link));link.addEventListener('focus',start);link.addEventListener('blur',()=>stopPreview(link));link.addEventListener('click',()=>stopPreview(link));$('gallery').append(link);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
function applyRotation(){
 const sideways=rotation%180!==0;
 const stage=$('image-stage'),image=$('letter-image');
 if(inspecting&&fullWidth){
  stage.style.width=(sideways?fullHeight:fullWidth)+'px';
  stage.style.height=(sideways?fullWidth:fullHeight)+'px';
  image.style.width=fullWidth+'px';image.style.height=fullHeight+'px';
  const translations={0:[0,0],90:[fullHeight,0],180:[fullWidth,fullHeight],270:[0,fullWidth]};
  const [x,y]=translations[rotation];
  image.style.transform=`translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  $('load-status').textContent=`${fullWidth.toLocaleString()} × ${fullHeight.toLocaleString()} px · ${rotation}°`;
 }else{
  stage.style.width='';stage.style.height='';
  image.style.width=(sideways?stage.clientHeight:stage.clientWidth)+'px';
  image.style.height=(sideways?stage.clientWidth:stage.clientHeight)+'px';
  image.style.transform=`translate(-50%, -50%) rotate(${rotation}deg)`;
  if(!inspecting)$('load-status').textContent=rotation?`${rotation}°`:'';
 }
 $('image-canvas').scrollTo(0,0);
}
function rotate(delta){if(!selected)return;rotation=(rotation+delta+360)%360;applyRotation();}
$('rotate-left').onclick=()=>rotate(-90);
$('rotate-right').onclick=()=>rotate(90);
function drawImage(reset=true){
 if(reset)rotation=0;
 fullWidth=0;fullHeight=0;
 $('rotation-controls').hidden=false;
 const image=selected.images[page];const token=++loadToken;inspecting=false;$('inspect').textContent='+ Inspect details';$('inspect').setAttribute('aria-pressed','false');$('image-canvas').classList.remove('inspecting');$('load-status').textContent='';
 $('letter-image').onload=()=>{if(token===loadToken)applyRotation();};
 $('letter-image').onerror=()=>{if(token===loadToken)$('load-status').textContent='Image unavailable. Try opening the original.';};
 $('letter-image').src=image.preview;$('letter-image').alt=`${date(selected)}, ${image.label}`;$('image-label').textContent=image.label;$('image-position').textContent=`Image ${page+1} of ${selected.images.length}`;$('previous-image').disabled=page===0;$('next-image').disabled=page===selected.images.length-1;$('original-link').href=image.src;
 applyRotation();
}
function moveImage(delta){if(!selected)return;const next=page+delta;if(next<0||next>=selected.images.length)return;page=next;drawImage();}
$('previous-image').onclick=()=>moveImage(-1);$('next-image').onclick=()=>moveImage(1);
$('inspect').onclick=()=>{
 if(!selected)return;
 if(inspecting){drawImage(false);return;}
 inspecting=true;const image=selected.images[page],token=++loadToken;$('inspect').textContent='− Fit artwork';$('inspect').setAttribute('aria-pressed','true');$('load-status').textContent='Loading full resolution…';
 const full=new Image();full.onload=()=>{if(token!==loadToken||!inspecting)return;$('letter-image').src=image.src;$('image-canvas').classList.add('inspecting');fullWidth=full.naturalWidth;fullHeight=full.naturalHeight;$('rotation-controls').hidden=false;applyRotation();};full.onerror=()=>{if(token!==loadToken)return;inspecting=false;$('inspect').setAttribute('aria-pressed','false');$('inspect').textContent='+ Inspect details';applyRotation();$('load-status').textContent='Could not load full resolution. Try opening the original.';};full.src=image.src;
};
const canvas=$('image-canvas');canvas.addEventListener('pointerdown',e=>{if(!inspecting||e.button!==0||e.pointerType!=='mouse')return;drag={x:e.clientX,y:e.clientY,left:canvas.scrollLeft,top:canvas.scrollTop};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});canvas.addEventListener('pointermove',e=>{if(!drag)return;canvas.scrollLeft=drag.left+drag.x-e.clientX;canvas.scrollTop=drag.top+drag.y-e.clientY;});function endDrag(){drag=null;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
function route(){stopAll();loadToken++;const match=location.hash.match(/^#letter\/(\d+)$/);selected=match?letters.find(l=>l.id===Number(match[1])):null;$('collection').hidden=!!selected;$('letter-view').hidden=!selected;if(!selected){document.title='The VEC Letters';return;}page=0;document.title=`${date(selected)} · The VEC Letters`;$('letter-date').textContent=date(selected);$('letter-position').textContent=`Letter ${String(selected.id).padStart(2,'0')} / ${letters.length}`;$('previous-letter').textContent=selected.id===1?'← All letters':'← Previous letter';$('previous-letter').href=selected.id===1?'#collection':'#letter/'+(selected.id-1);const next=$('next-letter');next.hidden=selected.id===letters.length;next.href='#letter/'+(selected.id+1);drawImage();window.scrollTo(0,0);}
new ResizeObserver(()=>{if(selected)applyRotation();}).observe($('image-canvas'));
window.addEventListener('hashchange',route);document.addEventListener('keydown',e=>{if(!selected||e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowLeft'){e.preventDefault();moveImage(-1);}if(e.key==='ArrowRight'){e.preventDefault();moveImage(1);}if(e.key==='Escape'&&inspecting)drawImage(false);});route();
})();
