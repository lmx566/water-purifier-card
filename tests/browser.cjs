/* Development-only integration checks against synthetic HA data. Never installed by HACS. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium, webkit, firefox} = require('playwright');
const root = path.resolve(__dirname, '..');
const results = [], errors = [], external = [];
const engines = {chromium, webkit, firefox};
const engine = process.env.CARD_BROWSER || 'chromium';
const screenshotDir = process.env.CARD_SCREENSHOTS || path.join(root, 'docs/screenshots/v0.4.0');
const allowed = new Map([
  ['/preview.html', ['preview.html', 'text/html']],
  ['/water-purifier-card.js', ['water-purifier-card.js', 'text/javascript']],
  ['/examples/demo.js', ['examples/demo.js', 'text/javascript']]
]);
const server = http.createServer(async (req, res) => {
  if (req.url === '/module.html') {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end('<!doctype html><html lang="en"><head><title>Local HA fixture</title><script type="module" src="/water-purifier-card.js"></script></head><body></body></html>');return;
  }
  const file = allowed.get(req.url.split('?')[0]);
  if (!file) {res.writeHead(404);res.end();return;}
  try {res.writeHead(200, {'Content-Type':file[1], 'Cache-Control':'no-store'});res.end(await fs.readFile(path.join(root,file[0])));}
  catch {res.writeHead(500);res.end();}
});
let browser, page, origin;
async function test(name, fn) {
  const started = Date.now();
  try {await fn();results.push({name,passed:true,duration_ms:Date.now()-started});console.log('PASS ' + name);}
  catch (error) {results.push({name,passed:false,error:error.message,duration_ms:Date.now()-started});console.error('FAIL ' + name + '\n' + error.stack);await page?.screenshot({path:path.join(screenshotDir,engine+'-failure-'+results.length+'.png'),fullPage:true}).catch(()=>{});}
}
const eventually = (predicate, arg) => page.waitForFunction(predicate, arg, {timeout:6000});
const text = (card, selector) => card.locator(selector).first().textContent();
const cards = () => ['small','medium','full'].map(size=>page.locator('#card-'+size));
async function preview() {
  await page.goto(origin+'/preview.html');
  await eventually(()=>['small','medium','full'].every(size=>document.querySelector('#card-'+size)?.shadowRoot?.querySelector('[data-value=product_tds]')?.textContent==='8'));
  await eventually(()=>document.querySelector('#card-medium').shadowRoot.querySelector('.history-chart'));
}
async function mount(options={}) {
  await page.evaluate(options=>makeFixture(options),options);
  if (!options.delayedRegistry && options.registryMode!=='error') await eventually(()=>fixture.cards.every(card=>card.shadowRoot.querySelector('[data-role=discovery]').hidden));
  return page.locator('#fx0');
}
async function main() {
  if(!Object.hasOwn(engines,engine))throw new Error('Unsupported browser engine: '+engine);
  await fs.mkdir(screenshotDir,{recursive:true});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  origin='http://127.0.0.1:'+server.address().port;
  browser=await engines[engine].launch({headless:true,...(process.env.CARD_BROWSER_PATH?{executablePath:process.env.CARD_BROWSER_PATH}:{})});
  console.log(engine+' '+browser.version());
  const context=await browser.newContext({viewport:{width:1280,height:1000},locale:'en-US',timezoneId:'UTC',reducedMotion:'no-preference'});
  await context.route('**/*',route=>{if(route.request().url().startsWith(origin+'/'))return route.continue();external.push(route.request().url());return route.abort();});
  page=await context.newPage();page.setDefaultTimeout(6000);page.on('pageerror',error=>errors.push(error.message));

  await test('Three registered card types load and discover the same synthetic device',async()=>{
    await preview();
    const [small,medium,full]=cards();
    assert.equal(await page.evaluate(()=>window.customCards.filter(c=>['water-purifier-card','water-purifier-status-card','water-purifier-history-card'].includes(c.type)).length),3);
    assert.equal(await text(small,'[data-role=tile-phase]'),'Purifying');
    assert.equal(await text(medium,'[data-role=tile-phase]'),'Purifying');
    assert.equal(await text(full,'[data-role=status]'),'Purifying');
    assert.equal(await text(full,'[data-value=flow]'),'0.42');
    assert.equal(await full.locator('.filter-row').count(),5);
    assert.equal(await full.locator('[data-part]:visible').count(),12);
    assert.equal(await small.locator('.circuit,.history-chart').count(),0);
    assert.equal(await medium.locator('.circuit').count(),0);
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
    await page.screenshot({path:path.join(screenshotDir,engine+'-functional-gallery.png'),fullPage:true});
  });
  await test('Standby, flushing and real zero retain accurate output semantics',async()=>{
    await preview();const [small,medium,full]=cards();
    await page.selectOption('#scenario','idle');
    assert.equal(await text(small,'[data-role=tile-phase]'),'Standby');
    assert.equal(await text(small,'[data-role=tile-context]'),'Not producing');
    assert.equal(await text(medium,'[data-role=quality-note]'),'Latest reading');
    assert.equal(await text(full,'[data-value=flow]'),'0');
    assert.equal(await text(full,'[data-value=recovery]'),'—');
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.selectOption('#scenario','flushing');
    assert.equal(await text(small,'[data-role=tile-phase]'),'Rinsing');
    assert.equal(await text(full,'[data-value=flow]'),'0');
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).opacity),'0');
    assert.equal(await full.locator('.waste-stream:visible').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
  });
  await test('UV fault, disabled UV and unavailable or missing readings stay explicit',async()=>{
    await preview();const [small,medium,full]=cards();
    await page.selectOption('#scenario','fault');
    assert.equal(await text(small,'[data-role=tile-phase]'),'UV fault');
    assert.match(await text(medium,'[data-role=tile-alert]'),/UV current below limit/);
    assert.match(await text(full,'[data-role=alert]'),/UV current below limit/);
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.selectOption('#scenario','uv-disabled');
    assert.equal(await full.locator('[data-part=uv]').count(),0);
    assert.doesNotMatch(await text(small,'[data-role=tile-context]'),/UV/);
    for(const [scenario,note] of [['unavailable','Unavailable'],['disconnected','HA disconnected'],['missing','Entity not found'],['unknown','Unknown']]){
      await page.selectOption('#scenario',scenario);
      for(const card of cards())assert.equal(await text(card,'[data-value=product_tds]'),'—');
      assert.equal(await text(full,'[data-note=product_tds]'),note);
      assert.equal(await text(medium,'[data-role=quality-note]'),scenario==='disconnected'?'Unavailable':note);
    }
    await page.selectOption('#scenario','missing');
    assert.equal(await full.locator('[data-entity="sensor.demo_product_tds"]').first().isDisabled(),true);
  });
  await test('Filter reminders distinguish due, within limits, disabled, unknown and unregistered',async()=>{
    await preview();const medium=page.locator('#card-medium');
    assert.match(await text(medium,'[data-role=care-label]'),/PP.*Replacement due/);
    assert.equal(await text(medium,'[data-role=care-count]'),'Due: 1');
    await medium.locator('[data-action=filter-details]').click();
    assert.equal(await medium.locator('#care-list').isVisible(),true);
    assert.equal(await medium.locator('[data-action=filter-details]').getAttribute('aria-expanded'),'true');
    for(const [mode,label] of [['within','No replacement reminders due'],['disabled','Reminders are off'],['unknown','PP · Unknown'],['incomplete','PP · Replacement not recorded']]){
      await page.selectOption('#filter-mode',mode);assert.equal(await text(medium,'[data-role=care-label]'),label);
    }
  });
  await test('More-info and keyboard circuit details open read-only UI and return focus',async()=>{
    await preview();const [small,medium,full]=cards();
    await small.locator('[data-action=details]').click();assert.match(await page.locator('#info').textContent(),/sensor.demo_phase/);
    await medium.locator('[data-entity="sensor.demo_product_tds"]').first().click();assert.match(await page.locator('#info').textContent(),/sensor.demo_product_tds/);
    await medium.locator('[data-action=filter-details]').click();await medium.locator('[data-care-filter="0"]').click();assert.match(await page.locator('#info').textContent(),/sensor.demo_filter_1/);
    await full.locator('[data-part=pp]:visible').click();assert.match(await page.locator('#info').textContent(),/sensor.demo_filter_1/);
    await full.locator('[data-part=pump]:visible').focus();await page.keyboard.press('Enter');
    assert.match(await text(full,'[data-role=detail-text]'),/No individual status entity is mapped/);
    await full.locator('[data-action=close]').click();assert.equal(await full.evaluate(el=>el.shadowRoot.activeElement?.dataset.part),'pump');
    await page.keyboard.press('Space');assert.equal(await full.locator('[data-role=detail]').isVisible(),true);
  });
  await test('Selected-card hide overrides, motion preferences and theme do not affect sibling cards',async()=>{
    await preview();const [small,medium,full]=cards();
    await page.check('#hide-flow');await eventually(()=>!document.querySelector('#card-medium').shadowRoot.querySelector('[data-value=water_total]'));
    assert.equal(await full.locator('[data-value=water_total]').count(),1);
    assert.match(await text(small,'[data-role=tile-context]'),/0.42 L\/min/);
    await page.uncheck('#hide-flow');await eventually(()=>document.querySelector('#card-medium').shadowRoot.querySelector('[data-value=water_total]'));
    await page.selectOption('#selected-card','full');await page.uncheck('#animate');
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.check('#animate');await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await full.locator('.product-stream:visible').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});await page.check('#dark');
    for(const card of cards())assert.equal(await card.locator('ha-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(20, 35, 48)');
  });
  await test('Preview language and editor override affect each card independently',async()=>{
    await preview();await page.selectOption('#ha-language','zh-Hans');
    for(const card of cards())assert.equal(await card.getAttribute('lang'),'zh-Hans');
    const editor=page.locator('#editor');await page.locator('.support-grid > details > summary').click();
    await editor.locator('[data-option=language]').selectOption('de');
    assert.equal(await page.locator('#card-medium').getAttribute('lang'),'de');
    assert.equal(await page.locator('#card-full').getAttribute('lang'),'zh-Hans');
    await editor.locator('[data-option=title]').fill('My custom 厨房');await editor.locator('[data-option=title]').press('Tab');
    assert.equal(await text(page.locator('#card-medium'),'.tile-title'),'My custom 厨房');
    await page.selectOption('#ha-language','fr');
    assert.equal(await page.locator('#card-medium').getAttribute('lang'),'de');
    assert.equal(await text(page.locator('#card-medium'),'.tile-title'),'My custom 厨房');
  });
  await test('Visual editor manual mappings, draft preservation, custom filters and config round-trip',async()=>{
    await preview();const editor=page.locator('#editor'),card=page.locator('#card-medium');
    await page.locator('.support-grid > details > summary').click();
    await editor.evaluate(el=>el.addEventListener('config-changed',event=>el.setConfig(event.detail.config)));
    await editor.getByText('Water quality & production',{exact:true}).click();
    await editor.locator('[data-mode=product_tds]').selectOption('manual');
    await editor.locator('[data-mapping=product_tds]').fill('sensor.demo_feed_tds');await editor.locator('[data-mapping=product_tds]').press('Tab');
    await eventually(()=>document.querySelector('#card-medium').shadowRoot.querySelector('[data-value=product_tds]')?.textContent==='186');
    assert.equal(await editor.locator('[data-mapping=product_tds]').inputValue(),'sensor.demo_feed_tds');
    await editor.getByText('Filter names & circuit stages',{exact:true}).click();
    await editor.locator('[data-filter-name="0"]').fill('Sediment custom');
    await editor.locator('[data-option=language]').selectOption('zh-Hans');
    assert.equal(await editor.locator('[data-filter-name="0"]').inputValue(),'Sediment custom');
    await editor.locator('[data-action=refresh]').click();
    await eventually(()=>document.querySelector('#editor').shadowRoot.querySelector('[data-filter-name="0"]')?.value==='Sediment custom');
    await editor.locator('[data-action=save-filters]').click();
    await card.locator('[data-action=filter-details]').click();
    assert.equal(await text(card,'[data-care-filter="0"] span'),'Sediment custom');
    await editor.locator('[data-remove="0"]').click();await editor.locator('[data-action=save-filters]').click();
    assert.equal(await card.locator('[data-care-filter]').count(),4);
  });
  await test('Preview history modes expose recorded gaps, empty history and errors honestly',async()=>{
    await preview();const medium=page.locator('#card-medium'),full=page.locator('#card-full');
    await page.selectOption('#history-mode','gap');
    await eventually(()=>document.querySelector('#card-medium').shadowRoot.querySelector('.history-note')?.textContent==='Gaps indicate unavailable readings');
    assert.ok((await medium.locator('.history-chart .trace').getAttribute('d')).split('M').length>=3);
    for(const [mode,message] of [['empty','No recorded history'],['error','History unavailable']]){
      await page.selectOption('#history-mode',mode);
      await eventually(message=>document.querySelector('#card-medium').shadowRoot.querySelector('.history-message')?.textContent.includes(message),message);
      assert.match(await text(full,'.history-message'),new RegExp(message));
      assert.match(await text(medium,'.history-message'),/Live readings remain available/);
    }
  });

  // Public-component fixtures replace the demo with isolated HA snapshots and spies.
  // Registry/history calls below are plain functions. No real device, broker or HA server is used.
  await page.goto(origin+'/module.html');await page.waitForFunction(()=>customElements.get('water-purifier-history-card'));
  await page.evaluate(()=>{
    window.totalServiceCalls=0;
    window.makeFixture=(options={})=>{
      document.body.replaceChildren();
      const listeners=new Map(),subscriptions=new Map();
      const devices=[{id:'a',identifiers:[['mqtt','water_00000000000a']]},{id:'b',identifiers:[['mqtt','water_00000000000b']]}];
      const values={phase:'producing',fault:'none',product_tds:'4',feed_tds:'186',product_flow_rate:'0.42',waste_flow_rate:'0.18',product_water_total:'1234.56',waste_water_total:'500.1',production_hours:'18.4',starts:'12',uv_enabled:'enabled',uv_command:'commanded_on',uv_status:'commanded_on',filter_1:'due',filter_2:'within_limits',filter_3:'within_limits',filter_4:'within_limits',filter_5:'within_limits',filter_6:'not_fitted',filter_7:'not_fitted',filter_8:'not_fitted'};
      let entries=devices.flatMap(d=>Object.keys(values).map(key=>({device_id:d.id,platform:'mqtt',disabled_by:null,unique_id:d.identifiers[0][1]+'_'+key,entity_id:'sensor.'+d.id+'_'+key})));
      const states={};
      for(const d of devices)for(const [key,value] of Object.entries(values)){
        const id='sensor.'+d.id+'_'+key;states[id]={entity_id:id,state:key==='product_tds'&&d.id==='b'?'90':value,attributes:{...(/tds/.test(key)?{unit_of_measurement:'ppm'}:{}),...(/total/.test(key)?{unit_of_measurement:'L'}:{})},last_changed:new Date(Date.now()-1800000).toISOString(),last_updated:new Date().toISOString()};
      }
      const pendingRegistry=[],pendingHistory=[],wsCalls=[],apiCalls=[],events=[],popups=[];
      let services=0,registryMode=options.registryMode||'normal',historyMode=options.historyMode||'normal';
      const connection={connected:true,addEventListener:(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},removeEventListener:(name,fn)=>listeners.get(name)?.delete(fn),subscribeEvents:async(fn,name)=>{if(!subscriptions.has(name))subscriptions.set(name,new Set());subscriptions.get(name).add(fn);return()=>subscriptions.get(name).delete(fn);}};
      const historyResult=path=>{
        const [route,query]=path.split('?'),params=new URLSearchParams(query);const start=Date.parse(decodeURIComponent(route.slice('history/period/'.length))),end=Date.parse(params.get('end_time')),id=params.get('filter_entity_id');
        const rows=[0,.2,.4,.6,.8,1].map((part,index)=>({entity_id:id,state:historyMode==='gap'&&(index===2||index===3)?'unavailable':String(index+4),last_changed:new Date(start+(end-start)*part).toISOString()}));return [rows];
      };
      const hass={connected:true,connection,states,locale:{language:'en',number_format:'language',time_format:'24',time_zone:'server'},language:'en',config:{time_zone:'UTC'},callService:()=>{services++;window.totalServiceCalls++;throw Error('Unexpected control call');},callWS:async msg=>{
        wsCalls.push(msg);if(registryMode==='error')throw Error('Permission denied');
        const data=msg.type==='config/device_registry/list'?devices:msg.type==='config/entity_registry/list'?entries:null;if(!data)throw Error('Unexpected WS request');
        const snapshot=structuredClone(data);return options.delayedRegistry?new Promise(resolve=>pendingRegistry.push(()=>resolve(snapshot))):snapshot;
      },callApi:async(method,path)=>{
        apiCalls.push({method,path});if(historyMode==='error')throw Error('History fixture error');if(historyMode==='invalid')return {};if(historyMode==='empty')return [];
        const response=historyResult(path);if(historyMode==='pending')return new Promise(resolve=>pendingHistory.push(value=>resolve(value===undefined?response:value)));return response;
      }};
      const cards=[];
      const addCard=(tag='water-purifier-card',config={})=>{
        const card=document.createElement(tag);card.id='fx'+cards.length;card.style.cssText='display:block;width:760px;max-width:100%';
        card.setConfig({type:'custom:'+tag,device_id:options.device||'a',...config});card.hass=hass;
        card.addEventListener('hass-more-info',event=>events.push(event.detail.entityId));cards.push(card);document.body.append(card);return card;
      };
      window.open=(...args)=>{popups.push(args);return null;};
      const api={cards,hass,devices,events,popups,wsCalls,apiCalls,pendingRegistry,pendingHistory,addCard,historyResult,
        get entries(){return entries;},set entries(value){entries=value;},set registryMode(value){registryMode=value;},set historyMode(value){historyMode=value;},get services(){return services;},
        publish:()=>cards.forEach(card=>{card.hass={...hass};}),emit:name=>{for(const fn of listeners.get(name)??[])fn();for(const fn of subscriptions.get(name)??[])fn();},
        get listenerCount(){return [...listeners.values(),...subscriptions.values()].reduce((count,set)=>count+set.size,0);}};
      window.fixture=api;
      for(const tag of options.tags||['water-purifier-card'])addCard(tag,options.config||{});
      return true;
    };
  });
  await test('Exact registry identity, explicit overrides, hidden and ambiguous entities',async()=>{
    const card=await mount();assert.equal(await text(card,'[data-value=product_tds]'),'4');
    await page.evaluate(()=>fixture.cards[0].setConfig({device_id:'b',entities:{product_tds:'sensor.a_product_tds'}}));
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-value=product_tds]')?.textContent==='4');
    await page.evaluate(()=>fixture.cards[0].setConfig({device_id:'b',entities:{product_tds:null}}));
    await eventually(()=>!fixture.cards[0].shadowRoot.querySelector('[data-value=product_tds]'));
    await page.evaluate(()=>{fixture.entries.find(e=>e.entity_id==='sensor.b_product_tds').disabled_by='user';fixture.cards[0].setConfig({device_id:'b'});fixture.emit('entity_registry_updated');});
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await card.locator('[data-value=product_tds]').count(),0);
    await page.evaluate(()=>{const entry=fixture.entries.find(e=>e.entity_id==='sensor.b_product_tds');entry.disabled_by=null;fixture.entries.push({...entry,entity_id:'sensor.duplicate'});fixture.emit('entity_registry_updated');});
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await card.locator('[data-value=product_tds]').count(),0);
  });
  await test('Stale registry responses cannot overwrite a newer manual configuration',async()=>{
    const card=await mount({delayedRegistry:true});
    await page.evaluate(()=>fixture.cards[0].setConfig({entities:{state:'sensor.b_phase',product_tds:'sensor.b_product_tds'},show_history:false}));
    await page.evaluate(async()=>{fixture.pendingRegistry.splice(0).forEach(resolve=>resolve());await Promise.resolve();});
    assert.equal(await text(card,'[data-value=product_tds]'),'90');
    assert.equal(await card.locator('[data-role=discovery]').isVisible(),false);
  });
  await test('Registry permission errors preserve mapped readings and retry can recover',async()=>{
    const card=await mount({registryMode:'error',config:{entities:{state:'sensor.a_phase',product_tds:'sensor.b_product_tds'}}});
    await eventually(()=>!fixture.cards[0].shadowRoot.querySelector('[data-action=retry]').hidden);
    assert.equal(await text(card,'[data-value=product_tds]'),'90');
    assert.match(await text(card,'[data-role=discovery-text]'),/Could not discover entities/);
    await page.evaluate(()=>{fixture.registryMode='normal';});await card.locator('[data-action=retry]').click();
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await text(card,'[data-value=product_tds]'),'90');
  });
  await test('Disconnect, reconnect and reattachment refresh registry without leaked listeners',async()=>{
    const card=await mount();await eventually(()=>fixture.listenerCount===4);
    await page.evaluate(()=>fixture.emit('disconnected'));
    assert.equal(await card.locator('ha-card').evaluate(el=>el.classList.contains('running')),false);
    assert.equal(await text(card,'[data-value=product_tds]'),'—');
    await page.evaluate(()=>{fixture.entries.find(e=>e.entity_id==='sensor.a_product_tds').entity_id='sensor.renamed';fixture.hass.states['sensor.renamed']={state:'7',attributes:{}};delete fixture.hass.states['sensor.a_product_tds'];fixture.emit('ready');});
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-value=product_tds]')?.textContent==='7');
    await page.evaluate(()=>fixture.cards[0].remove());assert.equal(await page.evaluate(()=>fixture.listenerCount),0);
    await page.evaluate(()=>{fixture.entries.find(e=>e.entity_id==='sensor.renamed').entity_id='sensor.renamed_again';fixture.hass.states['sensor.renamed_again']={state:'9',attributes:{}};delete fixture.hass.states['sensor.renamed'];document.body.append(fixture.cards[0]);});
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-value=product_tds]')?.textContent==='9');
    assert.equal(await page.evaluate(()=>fixture.listenerCount),4);
  });
  await test('Unavailable phase hides retained values on small/medium cards and unknown enums stay raw',async()=>{
    await mount({tags:['water-purifier-status-card','water-purifier-history-card']});
    await page.evaluate(()=>{fixture.hass.states['sensor.a_phase'].state='unavailable';fixture.publish();});
    for(const id of ['#fx0','#fx1'])assert.equal(await text(page.locator(id),'[data-value=product_tds]'),'—');
    for(const state of ['new_future_phase','constructor','toString']){
      await page.evaluate(state=>{fixture.hass.states['sensor.a_phase'].state=state;fixture.publish();},state);
      assert.equal(await text(page.locator('#fx0'),'[data-role=tile-phase]'),state);
    }
  });
  await test('Invalid numeric states, literal zero and untrusted text cannot create markup',async()=>{
    const card=await mount({config:{title:'<img src=x onerror=alert(1)>',entities:{product_tds:'sensor.value',pressure:'sensor.pressure'},filters:[{name:'<b>Filter</b>',entity:'sensor.reminder'}]}});
    assert.equal(await card.locator('img,b').count(),0);
    for(const invalid of ['','unknown','unavailable','NaN','none','Infinity','not a number']){
      await page.evaluate(value=>{fixture.hass.states['sensor.value']={state:value,attributes:{}};fixture.publish();},invalid);
      assert.equal(await text(card,'[data-value=product_tds]'),'—');
    }
    await page.evaluate(()=>{fixture.hass.states['sensor.value']={state:'0',attributes:{unit_of_measurement:'<img>'}};fixture.hass.states['sensor.pressure']={state:'0',attributes:{unit_of_measurement:'bar'}};fixture.publish();});
    assert.equal(await text(card,'[data-value=product_tds]'),'0');assert.equal(await text(card,'[data-unit=product_tds]'),'<img>');
    assert.equal(await text(card,'[data-unit=pressure]'),'bar');assert.equal(await card.locator('img').count(),0);
    const rejected=await page.evaluate(()=>[null,{layout:'wrong'},{language:'ru'},{language:'constructor'},{animate:'true'},{entities:{bad:'sensor.x'}},{entities:{flow:''}},{filters:[{name:'',entity:'sensor.x'}]},{dashboard_url:'javascript:alert(1)'},{dashboard_url:'https://user:secret@example.com'}].map(config=>{try{fixture.cards[0].setConfig(config);return false;}catch{return true;}}));
    assert.ok(rejected.every(Boolean));
  });
  await test('Automatic filter slots hide not-fitted while explicit lists and stage mappings remain authoritative',async()=>{
    const card=await mount();assert.equal(await card.locator('.filter-row:visible').count(),5);
    await page.evaluate(()=>{fixture.hass.states['sensor.a_filter_5'].state='not_fitted';fixture.publish();});assert.equal(await card.locator('.filter-row:visible').count(),4);
    await page.evaluate(()=>{fixture.hass.states['sensor.a_filter_5'].state='unavailable';fixture.publish();});assert.equal(await card.locator('.filter-row:visible').count(),4);
    await page.evaluate(()=>fixture.cards[0].setConfig({device_id:'a',filters:[{name:'Only PP',entity:'sensor.a_filter_1',stage:'pp'},{name:'Only RO',entity:'sensor.a_filter_5',stage:'ro'}],stages:{pp:null}}));
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await card.locator('.filter-row:visible').count(),2);
    assert.equal(await card.locator('[data-part=udf],[data-part=cto],[data-part=post]').count(),0);
    await card.locator('[data-part=pp]:visible').click();assert.match(await text(card,'[data-role=detail-text]'),/Assign a verified filter reminder/);
    await page.evaluate(()=>fixture.cards[0].setConfig({device_id:'a',filters:[]}));
    await eventually(()=>fixture.cards[0].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await card.locator('.filter-row').count(),0);
    assert.equal(await card.locator('[data-part=pp]:visible').count(),1);
  });
  await test('History requests are read-only, bounded to selected entity and configured window',async()=>{
    await mount({tags:['water-purifier-status-card','water-purifier-history-card','water-purifier-card']});
    await eventually(()=>fixture.apiCalls.length===2&&fixture.cards[1].shadowRoot.querySelector('.history-chart'));
    const calls=await page.evaluate(()=>fixture.apiCalls);
    for(const call of calls){
      assert.equal(call.method,'GET');const [route,query]=call.path.split('?'),params=new URLSearchParams(query);
      assert.equal(params.get('filter_entity_id'),'sensor.a_product_tds');assert.equal(params.get('significant_changes_only'),'0');
      assert.equal(params.has('no_attributes'),true);assert.equal(params.has('minimal_response'),true);
      const duration=Date.parse(params.get('end_time'))-Date.parse(decodeURIComponent(route.slice('history/period/'.length)));assert.ok([3600000,21600000].includes(duration));
    }
    await page.evaluate(()=>{for(let i=0;i<20;i++)fixture.publish();});assert.equal(await page.evaluate(()=>fixture.apiCalls.length),2);
    assert.equal(await page.locator('#fx0').locator('[data-role=history]').count(),0);
    assert.equal(await page.evaluate(()=>fixture.services),0);
  });
  await test('History opt-out and small layout never call the API even with show_history true',async()=>{
    await mount({tags:['water-purifier-status-card'],config:{history_hours:24,show_history:true}});
    assert.equal(await page.evaluate(()=>fixture.apiCalls.length),0);
    await page.evaluate(()=>fixture.addCard('water-purifier-history-card',{show_history:false}));
    await eventually(()=>fixture.cards[1].shadowRoot.querySelector('[data-role=discovery]').hidden);
    assert.equal(await page.evaluate(()=>fixture.apiCalls.length),0);
    const badWindows=await page.evaluate(()=>[0,25,1.5,'6'].map(history_hours=>{try{fixture.cards[0].setConfig({history_hours});return false;}catch{return true;}}));assert.ok(badWindows.every(Boolean));
  });
  await test('Pending history is deduplicated, and stale results cannot replace a new entity',async()=>{
    const card=await mount({tags:['water-purifier-history-card'],historyMode:'pending'});
    await eventually(()=>fixture.pendingHistory.length===1);
    await page.evaluate(()=>{for(let i=0;i<10;i++)fixture.publish();});assert.equal(await page.evaluate(()=>fixture.apiCalls.length),1);
    await page.evaluate(()=>fixture.cards[0].setConfig({type:'custom:water-purifier-history-card',entities:{state:'sensor.b_phase',fault:'sensor.b_fault',product_tds:'sensor.b_product_tds'},history_hours:24}));
    await eventually(()=>fixture.pendingHistory.length===2);
    await page.evaluate(()=>fixture.pendingHistory[0]());
    assert.match(await text(card,'.history-message'),/Loading history/);
    assert.equal(await text(card,'[data-value=product_tds]'),'90');
    await page.evaluate(()=>fixture.pendingHistory[1]());await eventually(()=>fixture.cards[0].shadowRoot.querySelector('.history-chart'));
    assert.equal(await page.evaluate(()=>new URLSearchParams(fixture.apiCalls[1].path.split('?')[1]).get('filter_entity_id')),'sensor.b_product_tds');
  });
  await test('Removing or disconnecting the card prevents further history polling',async()=>{
    await mount({tags:['water-purifier-history-card'],historyMode:'pending'});await eventually(()=>fixture.pendingHistory.length===1);
    await page.evaluate(()=>fixture.cards[0].remove());assert.equal(await page.evaluate(()=>fixture.listenerCount),0);
    await page.evaluate(()=>{fixture.pendingHistory[0]();fixture.publish();});assert.equal(await page.evaluate(()=>fixture.apiCalls.length),1);
    await page.evaluate(()=>document.body.append(fixture.cards[0]));await eventually(()=>fixture.pendingHistory.length===2);
    await page.evaluate(()=>{fixture.pendingHistory[1]();fixture.emit('disconnected');fixture.publish();});
    assert.equal(await page.evaluate(()=>fixture.apiCalls.length),2);
  });
  await test('History gap/invalid/empty responses and latest unavailable data do not fabricate continuity',async()=>{
    const card=await mount({tags:['water-purifier-history-card'],historyMode:'gap'});await eventually(()=>fixture.cards[0].shadowRoot.querySelector('.history-chart'));
    assert.ok((await card.locator('.trace').getAttribute('d')).split('M').length>=3);
    assert.equal(await text(card,'.history-note'),'Gaps indicate unavailable readings');
    await page.evaluate(()=>{fixture.hass.states['sensor.a_product_tds'].state='unavailable';fixture.publish();});
    assert.equal(await text(card,'.history-note'),'Recorded history · live reading unavailable');
    for(const [mode,expected] of [['invalid','History unavailable'],['empty','No recorded history'],['error','History unavailable']]){
      await page.evaluate(mode=>{fixture.historyMode=mode;fixture.cards[0].setConfig({type:'custom:water-purifier-history-card',device_id:'a'});},mode);
      await eventually(expected=>fixture.cards[0].shadowRoot.querySelector('.history-message')?.textContent===expected,expected);
    }
  });
  await test('User links use safe URLs and native more-info without sending control services',async()=>{
    const card=await mount({tags:['water-purifier-status-card'],config:{dashboard_url:'https://example.test/device'}});
    await card.locator('[data-action=details]').click();
    assert.deepEqual(await page.evaluate(()=>fixture.popups),[['https://example.test/device','_blank','noopener,noreferrer']]);
    await page.evaluate(()=>{fixture.hass.states['sensor.a_fault'].state='uv_sensor';fixture.publish();});
    await card.locator('[data-action=details]').click();assert.deepEqual(await page.evaluate(()=>fixture.events),['sensor.a_fault']);
    assert.equal(await page.evaluate(()=>fixture.services),0);
  });
  await test('Editor refreshes registry names after reattachment and module public APIs work',async()=>{
    await mount();
    await page.evaluate(()=>{const editor=document.createElement('water-purifier-card-editor');editor.id='fixture-editor';editor.setConfig({device_id:'a'});editor.hass=fixture.hass;document.body.append(editor);window.fixtureEditor=editor;});
    await eventually(()=>fixtureEditor.shadowRoot.querySelector('[data-option=device_id] option[value=a]')?.textContent==='a');
    await page.evaluate(()=>{fixtureEditor.remove();fixture.devices[0].name_by_user='Renamed kitchen';document.body.append(fixtureEditor);});
    await eventually(()=>fixtureEditor.shadowRoot.querySelector('[data-option=device_id] option[value=a]')?.textContent==='Renamed kitchen');
    const api=await page.evaluate(()=>['water-purifier-card','water-purifier-status-card','water-purifier-history-card'].map(tag=>{const Class=customElements.get(tag),card=new Class();card.setConfig(Class.getStubConfig());return {editor:Class.getConfigElement().tagName,size:card.getCardSize(),columns:card.getGridOptions().columns};}));
    assert.deepEqual(api.map(x=>x.size),[12,3,6]);assert.ok(api.every(x=>x.editor==='WATER-PURIFIER-CARD-EDITOR'&&x.columns===12));
  });
  await test('No uncaught browser exceptions, service writes or non-local network requests',async()=>{
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(await page.evaluate(()=>window.totalServiceCalls),0);
  });
  const sourceHash=crypto.createHash('sha256').update(await fs.readFile(path.join(root,'water-purifier-card.js'))).digest('hex');
  const summary={date:new Date().toISOString(),engine,version:browser.version(),card_version:'0.4.0',source_sha256:sourceHash,scope:'Three HA cards, synthetic local registry/history only; no ESP32 or real HA connection',passed:results.filter(x=>x.passed).length,total:results.length,errors,external,results};
  await fs.writeFile(path.join(screenshotDir,engine+'-functional-results.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(`${summary.passed}/${summary.total} checks passed`);if(results.some(x=>!x.passed))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
