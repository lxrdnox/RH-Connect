(() => {
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations=new WeakMap();
  function enter(root){
    if(!root)return;
    const previous=animations.get(root);if(previous)previous.cancel();
    if(reduced.matches||typeof root.animate!=='function')return;
    const animation=root.animate([{opacity:.6,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.2,.8,.2,1)'});
    animations.set(root,animation);
    animation.onfinish=()=>{if(animations.get(root)===animation)animations.delete(root)};
  }
  function skeleton(){
    return '<div class="rc-skeleton" role="status" aria-label="Sincronizando dados do portal"><span class="rc-skeleton-label">Sincronizando dados do portal…</span><div class="rc-skeleton-grid" aria-hidden="true">'+Array.from({length:4},()=>'<div class="rc-skeleton-card"><i></i><i></i><i></i></div>').join('')+'</div></div>';
  }
  function dismissibleToast(el,timeout=5000){
    const button=document.createElement('button');button.type='button';button.className='rc-toast-close';button.setAttribute('aria-label','Dispensar notificação');button.innerHTML=window.RHDesign.icon('close');el.append(button);
    let remaining=timeout,started=0,timer=null,hovered=false,focused=false;
    function remove(){clearTimeout(timer);timer=null;el.remove()}
    function resume(){if(timer!==null||hovered||focused||!el.isConnected)return;started=performance.now();timer=setTimeout(remove,Math.max(0,remaining))}
    function pause(){if(timer!==null){clearTimeout(timer);timer=null;remaining-=performance.now()-started}}
    button.addEventListener('click',remove);
    el.addEventListener('pointerenter',()=>{hovered=true;pause()});
    el.addEventListener('pointerleave',()=>{hovered=false;resume()});
    el.addEventListener('focusin',()=>{focused=true;pause()});
    el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget)){focused=false;resume()}});
    resume();
  }
  function syncFilter(root){
    if(!root)return;
    const select=root.querySelector('#ed-department');if(!select)return;
    select.addEventListener('change',()=>enter(root.querySelector('#ed-management-content')));
  }
  window.RHMotion={enter,skeleton,dismissibleToast,syncFilter};
})();