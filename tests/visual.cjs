/* Development-only responsive/visual checks. Uses local synthetic HA, never a device. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const engines = require('playwright');
const root = path.resolve(__dirname, '..');
const engine = process.env.CARD_BROWSER || 'chromium';
const output = process.env.CARD_SCREENSHOTS || path.join(root, 'docs/screenshots/v0.4.0');
const locales = ['en','zh-Hans','zh-Hant','de','fr','es','it','nl','pt-BR','ja','ko'];
const layouts = ['small','medium','full'];
const widths = [280,320,360,390,480,680,900];
const results = [], errors = [], external = [];
const allowed = new Map([
  ['/preview.html',['preview.html','text/html']],
  ['/water-purifier-card.js',['water-purifier-card.js','text/javascript']],
  ['/examples/demo.js',['examples/demo.js','text/javascript']]
]);
const server = http.createServer(async (req,res) => {
  const entry=allowed.get(req.url.split('?')[0]);
  if(!entry){res.writeHead(404);res.end();return;}
  try{res.writeHead(200,{'Content-Type':entry[1],'Cache-Control':'no-store'});res.end(await fs.readFile(path.join(root,entry[0])));}
  catch{res.writeHead(500);res.end();}
});
let browser;
async function test(name,fn){
  try{await fn();results.push({name,passed:true});console.log('PASS '+name);}
  catch(error){results.push({name,passed:false,error:error.message});console.error('FAIL '+name+'\n'+error.message);}
}
async function inspect(card){
  return card.evaluate(host=>{
    const r=host.shadowRoot,outer=r.querySelector('ha-card'),b=outer.getBoundingClientRect();
    const visible=el=>el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
    const clipped=[...r.querySelectorAll('h2,.status,.caption,.value,.unit,.tile-title,.tile-phase,.tile-context,.tile-caption,.tile-value,.tile-unit,.care-label,.care-count,.filter-state,.filter-name,.reminder-summary,.history-message,.trend-head,.dash-section-head')]
      .filter(visible).flatMap(el=>{const e=el.getBoundingClientRect();return e.left<b.left-1||e.right>b.right+1||el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).display!=='inline'?[{class:el.className,text:el.textContent.slice(0,90),width:e.width,scroll:el.scrollWidth}]:[];});
    const vectorClips=[...r.querySelectorAll('.circuit')].filter(visible).flatMap(svg=>{
      const s=svg.getBoundingClientRect();
      return [...svg.querySelectorAll('.part text')].flatMap(el=>{const e=el.getBoundingClientRect();return e.left<s.left-1||e.right>s.right+1||e.top<s.top-1||e.bottom>s.bottom+1?[{part:el.closest('[data-part]').dataset.part,text:el.textContent}]:[];});
    });
    return {width:host.clientWidth,scroll:host.scrollWidth,clipped,vectorClips,height:b.height};
  });
}
async function ready(page){
  await page.waitForFunction(()=>['small','medium','full'].every(k=>document.querySelector('#card-'+k)?.shadowRoot?.querySelector('[data-value=product_tds]')?.textContent==='8'));
  await page.waitForFunction(()=>document.querySelector('#card-medium').shadowRoot.querySelector('.history-chart'));
}
async function main(){
  await fs.mkdir(output,{recursive:true});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  browser=await engines[engine].launch({headless:true,...(process.env.CARD_BROWSER_PATH?{executablePath:process.env.CARD_BROWSER_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1200,height:1100},reducedMotion:'reduce',locale:'en-US',timezoneId:'UTC'});
  await context.route('**/*',route=>{if(route.request().url().startsWith(origin+'/'))return route.continue();external.push(route.request().url());return route.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(5000);
  await page.goto(origin+'/preview.html');await ready(page);
  for(const language of ['en','zh-Hans','de']){
    await page.selectOption('#ha-language',language);
    for(const dark of [false,true]){
      await page.locator('#dark').setChecked(dark);
      for(const layout of layouts)await page.locator('#card-'+layout).screenshot({path:path.join(output,`${engine}-${language}-${layout}-${dark?'dark':'light'}.png`)});
      if(language==='en'&&!dark)await page.locator('#preview-gallery').screenshot({path:path.join(output,`${engine}-three-cards.png`)});
    }
  }
  await page.uncheck('#dark');
  await page.evaluate(()=>{document.querySelector('#preview-gallery').style.display='block';document.querySelectorAll('.card-slot').forEach(el=>{el.style.maxWidth='none';el.style.marginBottom='24px';});});
  for(const language of locales){
    await page.selectOption('#ha-language',language);
    for(const layout of layouts)await test(`${language}: ${layout} containment at ${widths.join('/')} px`,async()=>{
      const card=page.locator('#card-'+layout);
      for(const width of widths){
        await card.evaluate((el,width)=>{el.closest('.card-slot').style.width=width+'px';},width);
        const result=await inspect(card);
        assert.equal(result.width,width);
        assert.ok(result.scroll<=width+1,`${width}px card scrolls to ${result.scroll}`);
        assert.deepEqual(result.clipped,[],`${width}px text clipping: ${JSON.stringify(result.clipped)}`);
        assert.deepEqual(result.vectorClips,[],`${width}px circuit label clipping: ${JSON.stringify(result.vectorClips)}`);
        assert.ok(result.height>80);
      }
    });
  }
  await test('Long custom titles, unknown fault identifiers and large counters stay inside cards',async()=>{
    for(const layout of layouts){
      const card=page.locator('#card-'+layout);
      await card.evaluate(el=>{
        el.closest('.card-slot').style.width='320px';
        el.setConfig({...el._config,title:'Kitchen水系统 · Geräteübersicht · '+ 'a'.repeat(50)});
        const h=el.hass,states=structuredClone(h.states);
        states['sensor.demo_product_water_total'].state='12345678.9';states['sensor.demo_waste_water_total'].state='12345678.9';
        states['sensor.demo_fault'].state='new_fault_identifier_'+ 'a'.repeat(80);
        el.hass={...h,states};
      });
      const result=await inspect(card);
      assert.deepEqual(result.clipped,[],layout+' text clipping: '+JSON.stringify(result.clipped));
      assert.ok(result.scroll<=321);
    }
  });
  await test('Preview and expanded editor fit 320/375/768 px viewport',async()=>{
    await page.reload();await ready(page);await page.selectOption('#ha-language','de');
    await page.locator('.support-grid > details > summary').click();
    await page.locator('#editor').evaluate(el=>el.shadowRoot.querySelectorAll('details').forEach(d=>d.open=true));
    for(const width of [320,375,768]){
      await page.setViewportSize({width,height:1000});
      const size=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
      assert.ok(size.scroll<=size.client+1,`${width}px preview overflows to ${size.scroll}px`);
      const editor=await page.locator('#editor').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth}));
      assert.ok(editor.scroll<=editor.client+1,`${width}px editor overflows: ${JSON.stringify(editor)}`);
      if(width===375){
        for(const layout of layouts)await page.locator('#card-'+layout).screenshot({path:path.join(output,`${engine}-de-${layout}-mobile.png`)});
        await page.locator('#editor').screenshot({path:path.join(output,`${engine}-de-editor-mobile.png`)});
      }
    }
  });
  await test('No page errors or external resource requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
  const sourceHash=crypto.createHash('sha256').update(await fs.readFile(path.join(root,'water-purifier-card.js'))).digest('hex');
  const report={date:new Date().toISOString(),engine,browser:browser.version(),playwright:require('playwright/package.json').version,node:process.version,sourceHash,passed:results.filter(r=>r.passed).length,total:results.length,results};
  await fs.writeFile(path.join(output,`${engine}-visual-results.json`),JSON.stringify(report,null,2)+'\n');
  console.log(`${report.passed}/${report.total} visual checks passed`);if(report.passed!==report.total)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
