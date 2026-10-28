// Renders tools/profile/profile.html to A4 PDFs (English + Arabic).
// Usage: python3 tools/profile/shrink.py && node tools/profile/build.mjs   (needs a local server on :8766 serving the repo root)
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const lang of ['en','ar']){
  const p=await b.newPage();
  await p.goto(`http://127.0.0.1:8766/tools/profile/profile.html?lang=${lang}&cache=1`,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  await p.evaluate(()=>Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;}))));
  const out=process.argv[2]||'assets/docs';
  await p.pdf({path:`${out}/melsa-company-profile${lang==='ar'?'-ar':''}.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});
  console.log('built',lang);
}
await b.close();
