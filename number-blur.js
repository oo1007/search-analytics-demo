/* Local display protection. Original report data still exists in the source files. */
(() => {
  'use strict';
  const root=document.documentElement;
  const fontName='ReportNumericMaskV2';
  const fontUrl='data:font/ttf;base64,AAEAAAAKAIAAAwAgT1MvMmu96lYAAAEoAAAAYGNtYXAADCB1AAABkAAAADRnbHlm/SYwpAAAAcwAAAAuaGVhZDGQND8AAACsAAAANmhoZWEM9AM4AAAA5AAAACRobXR4BTgAAAAAAYgAAAAGbG9jYQAXAAAAAAHEAAAABm1heHAABAAOAAABCAAAACBuYW1lCXNILwAAAfwAAAE+cG9zdGJ5b20AAAM8AAAAKwABAAAAAQAAdDBFul8PPPUAAwgAAAAAAOcU9MIAAAAA5xT0wgDoAZoDaAQpAAAAAwACAAAAAAAAAAEAAAii/f4AAARQAOgA6ANoAAEAAAAAAAAAAAAAAAAAAAABAAEAAAACAAwAAQAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAwRQAZAABQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAPz8/PwAAICIgIgii/f4AAAiiAgIAAAAAAAAAAAAAAAAAAAAgAAAEUAAAAOgAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQAIAAAAAQABAABAAAgIv//AAAgIv//398AAQAAAAAAAAAAABcAAAABAOgBmgNoBCkACwAAASEyNRE0IyEiFREUAWMBint7/nZ7AZp7AZl7e/5newAAAAAAAAwAlgABAAAAAAABABMAAAABAAAAAAACAAcAEwABAAAAAAADABMAGgABAAAAAAAEABMAAAABAAAAAAAFAAsALQABAAAAAAAGABMAGgADAAEECQABACYAOAADAAEECQACAA4AXgADAAEECQADACYAbAADAAEECQAEACYAOAADAAEECQAFABYAkgADAAEECQAGACYAbFJlcG9ydCBOdW1lcmljIE1hc2tSZWd1bGFyUmVwb3J0TnVtZXJpY01hc2tWMlZlcnNpb24gMi4wAFIAZQBwAG8AcgB0ACAATgB1AG0AZQByAGkAYwAgAE0AYQBzAGsAUgBlAGcAdQBsAGEAcgBSAGUAcABvAHIAdABOAHUAbQBlAHIAaQBjAE0AYQBzAGsAVgAyAFYAZQByAHMAaQBvAG4AIAAyAC4AMAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAQIEbWFzawA=';
  root.classList.add('report-numbers-pending');
  const style=document.createElement('style');
  style.id='report-number-mask-style';
  style.textContent=`
    @font-face{font-family:${fontName};src:url("${fontUrl}") format("truetype");font-weight:100 900;font-display:block;unicode-range:U+2022;}
    html.report-numbers-pending body{visibility:hidden!important;}
    .report-numbers-masked{font-family:"${fontName}",var(--report-original-font),sans-serif!important;}
  `;
  document.head.appendChild(style);
  const skip='script,style,noscript,select,option,input,textarea,[data-number-mask-public]';
  const attributeNames=['title','aria-label','alt','data-original-title'];
  const maskDigits=text=>text.replace(/[0-9\uFF10-\uFF19]/g,'\u2022');
  const containsDigits=text=>/[0-9\uFF10-\uFF19]/.test(text);
  const originalFonts=new WeakSet();
  function useMaskFont(parent){
    if(originalFonts.has(parent))return;
    const original=getComputedStyle(parent).fontFamily.replace(/(?:["']?ReportNumericMaskV2["']?\s*,?\s*)+/g,'');
    parent.style.setProperty('--report-original-font',original||'sans-serif');
    parent.classList.add('report-numbers-masked');
    originalFonts.add(parent);
  }
  function maskText(node){
    const parent=node.parentElement;
    if(!parent||parent.closest(skip)||!containsDigits(node.nodeValue))return;
    useMaskFont(parent);
    // Keep the very same text node so React can continue updating it normally.
    node.nodeValue=maskDigits(node.nodeValue);
  }
  function maskAttributes(element){
    if(element.closest(skip))return;
    for(const name of attributeNames){
      const value=element.getAttribute(name);
      if(value&&containsDigits(value))element.setAttribute(name,maskDigits(value));
    }
  }
  function maskSubtree(node){
    if(node.nodeType===Node.TEXT_NODE){maskText(node);return;}
    if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE)return;
    if(node.nodeType===Node.ELEMENT_NODE){
      if(node.matches(skip))return;
      maskAttributes(node);
    }
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode(current){
        if(current.nodeType===Node.ELEMENT_NODE&&current.matches(skip))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let current;
    while((current=walker.nextNode())){
      if(current.nodeType===Node.TEXT_NODE)maskText(current);
      else maskAttributes(current);
    }
  }
  const observer=new MutationObserver(records=>{
    // Mutation observers run before the next paint, including framework tab updates.
    observer.disconnect();
    try{
      for(const record of records){
        if(record.type==='characterData'&&record.target.isConnected)maskText(record.target);
        else if(record.type==='attributes'&&record.target.isConnected)maskAttributes(record.target);
        else for(const added of record.addedNodes)if(added.isConnected)maskSubtree(added);
      }
    }finally{observe();}
  });
  function observe(){observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributeNames});}
  maskSubtree(root);observe();
  const domReady=document.readyState==='loading'?new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true})):Promise.resolve();
  Promise.all([domReady,document.fonts.load(`16px ${fontName}`,'\u2022').catch(()=>[])]).then(()=>{
    observer.disconnect();maskSubtree(root);observe();
    root.classList.remove('report-numbers-pending');
  });
})();

;(()=>{const start=()=>{document.querySelectorAll('a[href="#private-source-removed"]').forEach(a=>{a.removeAttribute('href');a.textContent='内部资料入口已移除';a.setAttribute('aria-disabled','true')});if(!document.getElementById('public-demo-note')){const n=document.createElement('p');n.id='public-demo-note';n.setAttribute('data-number-mask-public','');n.textContent='公开演示 · 业务数字已替换并遮蔽，图表仅用于展示交互，不代表真实业务表现。';n.style.cssText='margin:8px 0;color:#667085;font-size:12px';(document.querySelector('header')||document.body).append(n)}};new MutationObserver(start).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',start);})();
