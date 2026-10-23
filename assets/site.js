/* Melsa Elevators — shared header, footer, language and helpers for the public pages */
(function(){
const SITE=window.MELSA_SITE||{company:{},clients:[],projects:[]}, C=SITE.company||{};
const T={
 en:{"nav.home":"Home","nav.about":"About us","nav.projects":"Projects","nav.catalog":"Catalog","nav.clients":"Clients","nav.maint":"Maintenance","nav.consult":"Consulting","nav.contact":"Contact us","nav.eng":"🔒 Engineers",
  "f.about":"Melsa Elevators designs, supplies, installs and maintains elevators for homes, buildings and businesses.","f.links":"Pages","f.contact":"Contact",
  "f.rights":"© {y} Melsa Elevators. All rights reserved.","f.soon":"Contact details coming soon.","f.engineers":"Engineers' area",
  notSet:"Our contact details are being added. Please check back soon.",sent:"Opening WhatsApp…",required:"Please fill in your name and phone number.",
  "ci.phone":"Phone","ci.mobile":"Mobile","ci.whatsapp":"WhatsApp","ci.email":"Email","ci.address":"Address","ci.hours":"Working hours","ci.facebook":"Facebook","ci.instagram":"Instagram",close:"Close",
  "t.Residential":"Residential","t.Villa":"Villa","t.Factory":"Factory","t.Hospital":"Hospital","t.Mall":"Mall","t.Office":"Office","t.Hotel":"Hotel"},
 ar:{"nav.home":"الرئيسية","nav.about":"من نحن","nav.projects":"مشاريعنا","nav.catalog":"الكتالوج","nav.clients":"عملاؤنا","nav.maint":"الصيانة","nav.consult":"استشارات","nav.contact":"تواصل معنا","nav.eng":"🔒 المهندسين",
  "f.about":"إلكتروميلسا للمصاعد تصمم وتورّد وتركّب وتصاين المصاعد للمنازل والمباني والشركات.","f.links":"الصفحات","f.contact":"تواصل",
  "f.rights":"© {y} إلكتروميلسا للمصاعد. جميع الحقوق محفوظة.","f.soon":"بيانات التواصل قريبًا.","f.engineers":"منطقة المهندسين",
  notSet:"بيانات التواصل قيد الإضافة. برجاء المحاولة لاحقًا.",sent:"جارٍ فتح واتساب…",required:"برجاء كتابة الاسم ورقم التليفون.",
  "ci.phone":"التليفون الأرضي","ci.mobile":"الموبايل","ci.whatsapp":"واتساب","ci.email":"البريد الإلكتروني","ci.address":"العنوان","ci.hours":"مواعيد العمل","ci.facebook":"فيسبوك","ci.instagram":"إنستجرام",close:"إغلاق",
  "t.Residential":"سكني","t.Villa":"فيلا","t.Factory":"مصنع","t.Hospital":"مستشفى","t.Mall":"مول","t.Office":"إداري","t.Hotel":"فندق"}
};
let lang="en"; try{const s=localStorage.getItem("melsaLang");if(s==="ar"||s==="en")lang=s;}catch(e){}
const PAGE_T=window.PAGE_T||{en:{},ar:{}};
function t(k,v){let s=(PAGE_T[lang]&&PAGE_T[lang][k])??(T[lang]&&T[lang][k])??PAGE_T.en?.[k]??T.en[k]??k; if(v)for(const x in v)s=s.split("{"+x+"}").join(v[x]); return s;}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const page=document.body.dataset.page;
const FB_ICON='<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" style="vertical-align:-.25em" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 19.5v-6.1h2.1l.3-2.4h-2.4V9.5c0-.7.2-1.2 1.2-1.2h1.3V6.2c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3V11H8.7v2.4h2.1v6.1h2.6z"/></svg>', IG_ICON='<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" style="vertical-align:-.25em" aria-hidden="true"><defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#igg)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.1" cy="7.9" r="1" fill="#fff"/></svg>';
const WA_ICON='<svg viewBox="0 0 24 24" width="1.25em" height="1.25em" style="vertical-align:-.25em;fill:#25d366" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';

/* header & footer */
const NAV=[["home","./"],["about","about.html"],["catalog","catalog.html"],["clients","clients.html"],["maint","maintenance.html"],["consult","consulting.html"],["contact","contact.html"]];
const header=document.createElement("header"); header.className="site-header";
header.innerHTML=`<div class="hwrap"><a class="logo" href="./"><img src="assets/logo.png" alt="Melsa Elevators" width="400" height="308"></a>
 <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false">☰</button>
 <nav class="nav">${NAV.map(([k,h])=>`<a href="${h}" data-k="${k}" class="${k===page?"on":""}"></a>`).join("")}<a class="eng" href="configurator.html" data-k="eng"></a><button type="button" class="lang-btn"></button></nav></div>`;
document.body.prepend(header);
const nav=header.querySelector(".nav"), mb=header.querySelector(".menu-btn");
mb.addEventListener("click",()=>{const o=nav.classList.toggle("open");mb.setAttribute("aria-expanded",o);mb.textContent=o?"✕":"☰";});
header.querySelector(".lang-btn").addEventListener("click",()=>setLang(lang==="ar"?"en":"ar"));

const footer=document.createElement("footer"); footer.className="site-footer"; document.body.append(footer);
function renderFooter(){
 const items=contactItems();
 footer.innerHTML=`<div class="fwrap"><div><span class="flogo"><img src="assets/logo.png" alt="Melsa Elevators"></span><p style="margin:12px 0 0">${esc(t("f.about"))}</p>${C.facebook||C.instagram?`<div class="fsocial">${C.facebook?`<a href="${esc(C.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${FB_ICON}</a>`:""}${C.instagram?`<a href="${esc(C.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${IG_ICON}</a>`:""}</div>`:""}</div>
 <div><h4>${esc(t("f.links"))}</h4><ul>${NAV.map(([k,h])=>`<li><a href="${h}">${esc(t("nav."+k))}</a></li>`).join("")}<li><a href="configurator.html">${esc(t("f.engineers"))}</a></li></ul></div>
 <div><h4>${esc(t("f.contact"))}</h4>${items.length?`<ul>${items.map(i=>`<li>${i.icon} ${i.href?`<a href="${esc(i.href)}" ${i.ext?'target="_blank" rel="noopener"':""}><bdi ${i.ltr?'dir="ltr"':""}>${esc(i.text)}</bdi></a>`:esc(i.text)}</li>`).join("")}</ul>`:`<p style="margin:0">${esc(t("f.soon"))}</p>`}</div></div>
 <div class="fbottom">${esc(t("f.rights",{y:new Date().getFullYear()}))}</div>`;
}
function contactItems(){
 const L=[];
 const tel=n=>"tel:+20"+n.replace(/\D/g,"").replace(/^0/,"");
 if(C.phone)L.push({k:"phone",icon:"☎️",text:C.phone,href:tel(C.phone),ltr:1});
 if(C.mobile)L.push({k:"mobile",icon:"📱",text:C.mobile,href:tel(C.mobile),ltr:1});
 if(C.whatsapp)L.push({k:"whatsapp",icon:WA_ICON,text:C.whatsapp.replace(/^20/,"0"),href:"https://wa.me/"+C.whatsapp,ext:1,ltr:1});
 if(C.email)L.push({k:"email",icon:"✉️",text:C.email,href:"mailto:"+C.email,ltr:1});
 const addr=lang==="ar"?(C.address_ar||C.address_en):(C.address_en||C.address_ar); if(addr)L.push({k:"address",icon:"📍",text:addr,href:C.mapsQuery?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(C.mapsQuery):"",ext:1});
 const hrs=lang==="ar"?(C.hours_ar||C.hours_en):(C.hours_en||C.hours_ar); if(hrs)L.push({k:"hours",icon:"🕘",text:hrs});
 if(C.facebook)L.push({k:"facebook",icon:FB_ICON,text:"Melsa Elevators",href:C.facebook,ext:1});
 if(C.instagram)L.push({k:"instagram",icon:IG_ICON,text:"@"+C.instagram.replace(/\/+$/,"").split("/").pop(),href:C.instagram,ext:1,ltr:1});
 return L;
}
if(C.whatsapp){const a=document.createElement("a");a.className="wa-float";a.href="https://wa.me/"+C.whatsapp;a.target="_blank";a.rel="noopener";a.setAttribute("aria-label","WhatsApp");
 a.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>';document.body.append(a);}

/* language */
function setLang(L){
 lang=L; try{localStorage.setItem("melsaLang",L)}catch(e){}
 document.documentElement.lang=L; document.documentElement.dir=L==="ar"?"rtl":"ltr";
 header.querySelectorAll("[data-k]").forEach(a=>a.textContent=t("nav."+a.dataset.k));
 header.querySelector(".lang-btn").textContent=L==="ar"?"English":"عربي";
 document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
 document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
 document.querySelectorAll("[data-i18n-ph]").forEach(el=>el.placeholder=t(el.dataset.i18nPh));
 document.querySelectorAll("select[data-opts]").forEach(sel=>{const v=sel.value;[...sel.options].forEach(o=>o.textContent=t(sel.dataset.opts+"."+o.value));sel.value=v;});
 if(PAGE_T.title)document.title=t("title");
 renderFooter();
 window.dispatchEvent(new Event("melsa:lang"));
}

/* helpers for pages */
let tm; function toast(m){let el=document.querySelector(".toast");if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");document.body.append(el);}el.textContent=m;el.hidden=false;clearTimeout(tm);tm=setTimeout(()=>el.hidden=true,4500);}
/* copy each request into the company CRM (fire-and-forget; WhatsApp/email still opens as before) */
function crmLead(d){try{fetch("https://help.melsaelevators.com/public/lead",{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain"},body:JSON.stringify(Object.assign({page:location.pathname},d))});}catch(e){}}
function send(subject,text){
 if(C.whatsapp){toast(t("sent"));window.open("https://wa.me/"+C.whatsapp+"?text="+encodeURIComponent(text),"_blank","noopener");return true;}
 if(C.email){location.href="mailto:"+C.email+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(text);return true;}
 toast(t("notSet")); return false;
}
function lightbox(srcs,start=0,caption=""){
 let i=start; const d=document.createElement("div"); d.className="lb";
 d.style.cssText="position:fixed;inset:0;z-index:95;background:#0a1730e6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px";
 d.innerHTML=`<img style="max-width:100%;max-height:calc(100vh - 120px);border-radius:12px;background:#fff" alt=""><div style="color:#fff;margin-top:10px;font-weight:700;text-align:center"></div>
 <div style="display:flex;gap:10px;margin-top:12px">${srcs.length>1?'<button class="btn ghost" data-a="-1">‹</button><button class="btn ghost" data-a="1">›</button>':""}<button class="btn red" data-a="x">${esc(t("close"))}</button></div>`;
 const img=d.querySelector("img"), cap=d.querySelector("div"); const show=()=>{img.src=srcs[i];cap.textContent=caption+(srcs.length>1?`  (${i+1}/${srcs.length})`:"");}; show();
 d.addEventListener("click",e=>{const a=e.target.dataset.a; if(a==="x"||e.target===d){d.remove();return;} if(a){i=(i+Number(a)+srcs.length)%srcs.length;show();}});
 document.addEventListener("keydown",function k(e){if(e.key==="Escape"){d.remove();document.removeEventListener("keydown",k);}});
 document.body.append(d);
}
window.Melsa={t,esc,lang:()=>lang,send,crmLead,toast,lightbox,contactItems,site:SITE};
setLang(lang);
/* welcome intro: animated logo, then the screen opens like elevator doors (once per visit) */
(function intro(){
 let seen=false; try{seen=sessionStorage.getItem("melsaIntro")==="1";sessionStorage.setItem("melsaIntro","1");}catch(e){}
 if(seen||/bot|crawl|spider|lighthouse/i.test(navigator.userAgent))return;
 const el=document.createElement("div"); el.id="intro"; el.setAttribute("aria-hidden","true");
 const tag=lang==="ar"?"إلكتروميلسا للمصاعد":"Crafted to Match Your Vision";
 el.innerHTML=`<div class="door l"></div><div class="door r"></div><div class="stage"><div class="logo">${["m","tri","red","txt"].map(k=>`<img class="p-${k}" src="assets/intro/${k}.png" alt="">`).join("")}</div><div class="tag">${esc(tag)}</div></div><div class="skip">${lang==="ar"?"اضغط للدخول":"Tap to enter"}</div>`;
 document.body.append(el); document.documentElement.style.overflow="hidden";
 let done=false, tmr;
 const open=()=>{if(done)return;done=true;clearTimeout(tmr);el.classList.add("open");document.documentElement.style.overflow="";setTimeout(()=>el.remove(),900);};
 el.addEventListener("click",open); addEventListener("keydown",open,{once:true});
 const imgs=[...el.querySelectorAll("img")]; let n=0;
 const start=()=>{if(el.classList.contains("go"))return; el.classList.add("go"); tmr=setTimeout(open,matchMedia("(prefers-reduced-motion: reduce)").matches?900:4000);};
 imgs.forEach(i=>{if(i.complete)n++;else i.addEventListener("load",()=>{if(++n===imgs.length)start();},{once:true});});
 if(n===imgs.length)start(); setTimeout(start,1500);
})();
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();
