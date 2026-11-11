/* Development-only multilingual browser checks. Synthetic HA; no device connection. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {createHash} = require('node:crypto');
const {chromium,webkit,firefox} = require('playwright');
const root = path.resolve(__dirname, '..');
const engine = process.env.CARD_BROWSER || 'chromium';
const engines = {chromium,webkit,firefox};
const reportPath = process.env.CARD_I18N_REPORT || path.join(root, 'docs/screenshots/v0.4.0/'+(engine==='chromium'?'i18n-results.json':'i18n-'+engine+'-results.json'));
const results = [], errors = [], external = [];
const languages = ['en','zh-Hans','zh-Hant','de','fr','es','it','nl','pt-BR','ja','ko'];
const tags = ['water-purifier-card','water-purifier-status-card','water-purifier-history-card'];
const server = http.createServer(async (req,res) => {
  if (req.url === '/fixture.html') {
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    res.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>Local i18n fixture</title><style>body{margin:20px}main{width:800px}water-purifier-card,water-purifier-status-card,water-purifier-history-card,water-purifier-card-editor{display:block;margin:20px}</style><script type="module" src="/water-purifier-card.js"></script><main id="fixture"></main></html>');return;
  }
  if (req.url === '/water-purifier-card.js') {
    try {res.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(await fs.readFile(path.join(root,'water-purifier-card.js')));}
    catch {res.writeHead(500);res.end();}
    return;
  }
  res.writeHead(404);res.end();
});
let browser, sourceHash;
async function test(name,fn) {
  try {await fn();results.push({name,passed:true});console.log('PASS '+name);}
  catch(error) {results.push({name,passed:false,error:error.stack||error.message});console.error('FAIL '+name+'\n'+error.message);}
}
async function main() {
  const source = await fs.readFile(path.join(root,'water-purifier-card.js'),'utf8');
  sourceHash = createHash('sha256').update(source).digest('hex');
  const dictionaryText = source.split('  const LOCALES = ')[1]?.split('\n};')[0];
  const dictionaries = JSON.parse(dictionaryText+'\n}');
  await test('All 11 dictionaries have the same keys and interpolation tokens',async()=>{
    assert.deepEqual(Object.keys(dictionaries).sort(),[...languages].sort());
    const keys=Object.keys(dictionaries.en).sort();
    assert.ok(keys.length>=250,'Expected the complete multilingual catalog');
    assert.ok(keys.includes('Last hour'),'Expected a singular history window message');
    for(const language of languages) {
      assert.deepEqual(Object.keys(dictionaries[language]).sort(),keys,language+' missing or surplus messages');
      for(const key of keys) {
        const translation=dictionaries[language][key];
        assert.equal(typeof translation,'string');assert.ok(translation.trim(),language+': '+key);
        assert.deepEqual((translation.match(/\{\w+\}/g)||[]).sort(),(key.match(/\{\w+\}/g)||[]).sort(),language+': '+key);
      }
    }
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  if(!engines[engine])throw new Error('Unsupported CARD_BROWSER: '+engine);
  browser=await engines[engine].launch({headless:true,...(process.env.CARD_BROWSER_PATH?{executablePath:process.env.CARD_BROWSER_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:1000},locale:'en-US',timezoneId:'UTC'});
  await context.route('**/*',route=>{
    if(route.request().url().startsWith(origin+'/'))return route.continue();
    external.push(route.request().url());return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/fixture.html');
  await page.evaluate(async()=>{await customElements.whenDefined('water-purifier-card-editor');});
  await page.evaluate(()=>{
    Date.now=()=>Date.UTC(2026,0,1,18,25,0);
    const listeners=new Map();
    const connection={connected:true,addEventListener:(key,fn)=>{if(!listeners.has(key))listeners.set(key,new Set());listeners.get(key).add(fn);},removeEventListener:(key,fn)=>listeners.get(key)?.delete(fn),subscribeEvents:async()=>()=>{}};
    const entity=(state,unit)=>({state,attributes:unit?{unit_of_measurement:unit}:{},last_changed:'2026-01-01T18:24:30.000Z'});
    const states={
      'sensor.demo_phase':entity('producing'),'sensor.demo_fault':entity('none'),
      'sensor.demo_product_tds':entity('8','ppm'),'sensor.demo_feed_tds':entity('186','ppm'),
      'sensor.demo_flow':entity('1.24','L/min'),'sensor.demo_waste_flow':entity('0.62','L/min'),
      'sensor.demo_water_total':entity('12345.6','L'),'sensor.demo_waste_total':entity('5678.9','L'),
      'sensor.demo_production_hours':entity('123.4','h'),'sensor.demo_starts':entity('23'),
      'sensor.demo_filter':entity('within_limits'),'sensor.demo_uv':entity('commanded_on'),
      'sensor.demo_uv_status':entity('commanded_on'),'sensor.demo_uv_enabled':entity('enabled')
    };
    window.baseConfig={entities:{state:'sensor.demo_phase',fault:'sensor.demo_fault',product_tds:'sensor.demo_product_tds',feed_tds:'sensor.demo_feed_tds',flow:'sensor.demo_flow',waste_flow:'sensor.demo_waste_flow',water_total:'sensor.demo_water_total',waste_total:'sensor.demo_waste_total',production_hours:'sensor.demo_production_hours',starts:'sensor.demo_starts',filter_1:'sensor.demo_filter',uv:'sensor.demo_uv',uv_status:'sensor.demo_uv_status',uv_enabled:'sensor.demo_uv_enabled'}};
    window.hassFixture={connected:true,connection,states,language:'en-US',locale:{language:'en-US',number_format:'language',time_format:'24',time_zone:'server'},config:{time_zone:'UTC'},
      callService:()=>{throw new Error('Unexpected service call');},callWS:async({type})=>{if(type==='config/device_registry/list'||type==='config/entity_registry/list')return [];throw new Error('Unexpected WS request');},
      callApi:async(method,url)=>{if(method!=='GET'||!url.startsWith('history/period/'))throw new Error('Unexpected API request');const start=Date.parse(decodeURIComponent(url.slice('history/period/'.length).split('?')[0]));return [[{state:'5',last_changed:new Date(start+60000).toISOString()},{state:'8',last_changed:'2026-01-01T18:24:30.000Z'}]];}
    };
    window.makeCard=(tag='water-purifier-card',config={})=>{
      const card=document.createElement(tag);card.setConfig({...baseConfig,...config});card.hass=hassFixture;document.querySelector('#fixture').append(card);return card;
    };
    window.makeEditor=(config={})=>{
      const editor=document.createElement('water-purifier-card-editor');editor.setConfig({...baseConfig,...config});editor.hass=hassFixture;document.querySelector('#fixture').append(editor);return editor;
    };
    window.clearFixture=()=>document.querySelector('#fixture').replaceChildren();
    window.setLanguage=(language,extras={})=>{
      hassFixture={...hassFixture,locale:{...hassFixture.locale,language,...extras}};
      for(const host of document.querySelector('#fixture').children)host.hass=hassFixture;
    };
  });
  for(const language of languages) {
    await test(language+': three cards and editor follow HA language with localized state/history/labels',async()=>{
      await page.evaluate(({language,tags})=>{clearFixture();setLanguage(language);window.cards=tags.map(tag=>makeCard(tag));window.editor=makeEditor();},{language,tags});
      await page.waitForFunction(()=>cards[2].shadowRoot.querySelector('.history-chart'));
      const actual=await page.evaluate(()=>({cards:cards.map(card=>({lang:card.lang,title:card.shadowRoot.querySelector('h2,.tile-title')?.textContent,text:card.shadowRoot.textContent,status:card.shadowRoot.querySelector('[data-role=status],[data-role=tile-phase]')?.textContent,quality:card.shadowRoot.querySelector('[data-value=product_tds]')?.textContent})),editor:{lang:editor.lang,title:editor.shadowRoot.querySelector('h3').textContent,text:editor.shadowRoot.textContent}}));
      for(const card of actual.cards){assert.equal(card.lang,language);assert.equal(card.title,dictionaries[language]['Water purifier']);assert.ok(card.status.includes(dictionaries[language].Purifying),card.status);assert.equal(card.quality,'8');}
      assert.equal(actual.editor.lang,language);assert.equal(actual.editor.title,dictionaries[language]['Water Purifier Cards']);
      assert.ok(actual.editor.text.includes(dictionaries[language]['Follow Home Assistant']));
      assert.ok(actual.cards[0].text.includes(dictionaries[language]['Last hour']));
      assert.ok(actual.cards[2].text.includes(dictionaries[language]['Last {count} hours'].replace('{count}','6')));
      assert.ok(actual.cards[2].text.includes(dictionaries[language].Cumulative));
    });
  }
  await test('Live locale changes update all layouts and editor; each card override stays independent',async()=>{
    await page.evaluate(({tags})=>{clearFixture();setLanguage('en');window.cards=tags.map(tag=>makeCard(tag));window.fixed=makeCard('water-purifier-status-card',{language:'ja',title:'Kitchen title'});window.editor=makeEditor();}, {tags});
    await page.waitForFunction(()=>cards[2].shadowRoot.querySelector('.history-chart'));
    for(const language of ['fr','zh-Hant','de']) {
      await page.evaluate(language=>setLanguage(language),language);
      const actual=await page.evaluate(()=>({titles:cards.map(c=>c.shadowRoot.querySelector('h2,.tile-title').textContent),languages:cards.map(c=>c.lang),editor:editor.shadowRoot.querySelector('h3').textContent,fixedTitle:fixed.shadowRoot.querySelector('.tile-title').textContent,fixedState:fixed.shadowRoot.querySelector('[data-role=tile-phase]').textContent,fixedLang:fixed.lang}));
      assert.deepEqual(actual.languages,[language,language,language]);assert.deepEqual(actual.titles,Array(3).fill(dictionaries[language]['Water purifier']));
      assert.equal(actual.editor,dictionaries[language]['Water Purifier Cards']);assert.equal(actual.fixedLang,'ja');assert.equal(actual.fixedTitle,'Kitchen title');assert.equal(actual.fixedState,dictionaries.ja.Purifying);
    }
  });
  await test('Chinese region/script aliases, Portuguese regions and unsupported profile fallback',async()=>{
    const aliases={'zh-CN':'zh-Hans','zh-SG':'zh-Hans','zh-Hans-CN':'zh-Hans','zh_TW':'zh-Hant','zh-HK':'zh-Hant','zh-MO':'zh-Hant','zh-Hant-TW':'zh-Hant','pt-PT':'pt-BR','de-AT':'de','ar':'en','xx-INVALID':'en'};
    for(const [input,expected]of Object.entries(aliases)) {
      await page.evaluate(input=>setLanguage(input),input);
      assert.equal(await page.evaluate(()=>cards[0].lang),expected,input);
      assert.equal(await page.evaluate(()=>cards[0].shadowRoot.querySelector('h2').textContent),dictionaries[expected]['Water purifier'],input);
    }
  });
  await test('Invalid configured locale is rejected; absent HA locale uses browser locale',async()=>{
    const actual=await page.evaluate(()=>{
      const failures=['ar','garbage','zh-Hans-CN-bogus',null,{}].map(language=>{try{document.createElement('water-purifier-card').setConfig({language});return false;}catch{return true;}});
      const c=makeCard('water-purifier-card');c.hass={...hassFixture,language:undefined,locale:undefined};return {failures,lang:c.lang};
    });
    assert.deepEqual(actual.failures,[true,true,true,true,true]);assert.equal(actual.lang,'en');
  });
  await test('Custom titles and filter names survive language changes unchanged, including default-looking strings',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('en');window.card=makeCard('water-purifier-card',{title:'Water purifier',filters:[{name:'Filter 1',entity:'sensor.demo_filter',stage:'pp'}]});window.editor=makeEditor({title:'Water purifier',filters:[{name:'Filter 1',entity:'sensor.demo_filter',stage:'pp'}]});setLanguage('ja');});
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('h2').textContent),'Water purifier');
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('.filter-name').textContent),'Filter 1');
    assert.equal(await page.evaluate(()=>editor.shadowRoot.querySelector('[data-option=title]').value),'Water purifier');
    assert.equal(await page.evaluate(()=>editor.shadowRoot.querySelector('[data-filter-name="0"]').value),'Filter 1');
  });
  await test('Editor locale hot switch preserves unsaved reminder draft, focus, selection and open groups',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('en');window.editor=makeEditor({filters:[{name:'Original',entity:'sensor.demo_filter',stage:'pp'}]});});
    await page.waitForFunction(()=>editor.shadowRoot.querySelector('h3'));
    await page.evaluate(()=>{const groups=editor.shadowRoot.querySelectorAll('details');groups[0].open=true;groups[groups.length-1].open=true;});
    const input=page.locator('water-purifier-card-editor [data-filter-name="0"]');
    await input.fill('Draft kitchen name');
    await input.evaluate(el=>el.setSelectionRange(2,7));
    await page.evaluate(()=>setLanguage('zh-Hant'));
    const actual=await page.evaluate(()=>{const r=editor.shadowRoot,a=r.activeElement;return {name:r.querySelector('[data-filter-name="0"]').value,focus:a?.dataset.filterName,start:a?.selectionStart,end:a?.selectionEnd,open:[...r.querySelectorAll('details')].map(d=>d.open)};});
    assert.equal(actual.name,'Draft kitchen name');assert.equal(actual.focus,'0');assert.equal(actual.start,2);assert.equal(actual.end,7);assert.equal(actual.open[0],true);assert.equal(actual.open[actual.open.length-1],true);
  });
  await test('Editor locale hot switch preserves an incomplete manual mapping without committing it',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('en');window.editor=makeEditor({entities:{state:'sensor.demo_phase'}});editor.shadowRoot.querySelector('details').open=true;});
    const editorLocator=page.locator('water-purifier-card-editor');
    await editorLocator.locator('[data-mode=product_tds]').selectOption('manual');
    await editorLocator.locator('[data-mapping=product_tds]').fill('sensor.');
    await page.evaluate(()=>setLanguage('de'));
    assert.equal(await editorLocator.locator('[data-mode=product_tds]').inputValue(),'manual');
    assert.equal(await editorLocator.locator('[data-mapping=product_tds]').inputValue(),'sensor.');
    assert.equal(await editorLocator.locator('[data-mapping=product_tds]').isVisible(),true);
    assert.equal(await page.evaluate(()=>editor.shadowRoot.activeElement?.dataset.mapping),'product_tds');
    assert.equal(await page.evaluate(()=>editor._config.entities.product_tds),undefined);
  });
  await test('Editor override changes and host config echo preserve reminder drafts and entity IDs',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('en');window.editor=makeEditor({filters:[{name:'Original',entity:'sensor.demo_filter',stage:'pp'}]});editor.addEventListener('config-changed',event=>editor.setConfig(event.detail.config));editor.shadowRoot.querySelectorAll('details').forEach(d=>d.open=true);});
    const e=page.locator('water-purifier-card-editor');await e.locator('[data-filter-name="0"]').fill('Unsaved name');
    await e.locator('[data-option=language]').selectOption('ko');
    assert.equal(await e.locator('[data-filter-name="0"]').inputValue(),'Unsaved name');
    assert.equal(await e.locator('[data-filter-entity="0"]').inputValue(),'sensor.demo_filter');
    assert.equal(await e.locator('h3').textContent(),dictionaries.ko['Water Purifier Cards']);
    await e.locator('[data-action=save-filters]').click();
    const config=await page.evaluate(()=>editor._config);
    assert.equal(config.language,'ko');assert.equal(config.filters[0].name,'Unsaved name');assert.equal(config.filters[0].stage,'pp');
  });
  for(const [format,language,expected]of [['comma_decimal','de','12,345.6'],['decimal_comma','en','12.345,6'],['space_comma','en','12\u202f345,6'],['quote_decimal','en','12’345.6'],['none','de','12345.6'],['language','de','12.345,6'],['system','de','12,345.6']]) {
    await test('HA number format '+format+' overrides presentation language consistently',async()=>{
      await page.evaluate(({format,language,tags})=>{clearFixture();setLanguage(language,{number_format:format});window.cards=tags.map(tag=>makeCard(tag));},{format,language,tags});
      // ICU releases use either straight or typographic Swiss grouping apostrophes.
      for(const index of [0,2])assert.equal((await page.evaluate(index=>cards[index].shadowRoot.querySelector('[data-value=water_total]').textContent,index)).replace(/’/g,"'"),expected.replace(/’/g,"'"));
    });
  }
  for(const [mode,zone,local]of [['12','America/New_York',false],['24','Asia/Tokyo',false],['24','Asia/Tokyo',true]]) {
    await test('Recorded history respects '+mode+'h and '+(local?'browser local timezone':zone),async()=>{
      await page.evaluate(({mode,zone,local})=>{clearFixture();setLanguage('en-US',{number_format:'language',time_format:mode,time_zone:local?'local':'server'});hassFixture={...hassFixture,config:{time_zone:zone}};window.card=makeCard('water-purifier-history-card');},{mode,zone,local});
      await page.waitForFunction(()=>card.shadowRoot.querySelector('.history-chart'));
      const actual=await page.evaluate(()=>({texts:[...card.shadowRoot.querySelectorAll('.history-chart text')].map(e=>e.textContent),label:card.shadowRoot.querySelector('.history-chart').getAttribute('aria-label')}));
      const expected=local?['12:25','18:25']:zone==='Asia/Tokyo'?['21:25','03:25']:['07:25 AM','01:25 PM'];
      assert.deepEqual(actual.texts.slice(-2).map(s=>s.replace(/\u202f/g,' ')),expected);
      for(const time of expected)assert.ok(actual.label.replace(/\u202f/g,' ').includes(time),actual.label);
    });
  }
  await test('Localized errors and unknown/unavailable/disabled/not-fitted remain distinct',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('zh-Hant');window.card=makeCard('water-purifier-card',{filters:[{name:'Kitchen',entity:'sensor.demo_filter',stage:'pp'}]});});
    for(const [state,key]of [['unknown','Unknown'],['unavailable','Unavailable'],['disabled','Reminder off'],['not_fitted','Not fitted']]) {
      await page.evaluate(state=>{hassFixture.states['sensor.demo_filter']={state,attributes:{}};card.hass={...hassFixture};},state);
      assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('[data-filter-value="0"]').textContent),dictionaries['zh-Hant'][key]);
    }
    const error=await page.evaluate(()=>{try{card.setConfig({language:'zh-Hant',history_hours:0});}catch(error){return error.message;}});
    assert.equal(error,dictionaries['zh-Hant']['history_hours must be an integer from 1 to 24.']);
    await page.evaluate(async()=>{window.editor=makeEditor({language:'ja'});await editor._load();editor._commit({...editor._config,history_hours:0});});
    assert.equal(await page.evaluate(()=>editor.shadowRoot.querySelector('[data-error]').textContent),dictionaries.ja['history_hours must be an integer from 1 to 24.']);
  });
  await test('Normal UV commands are omitted from the localized small-card state summary',async()=>{
    await page.evaluate(()=>{clearFixture();setLanguage('zh-Hant');hassFixture.states['sensor.demo_phase'].state='producing';hassFixture.states['sensor.demo_fault'].state='none';window.card=makeCard('water-purifier-status-card');});
    for(const [state,key]of [['commanded_on','UV commanded on'],['off','UV commanded off']]) {
      await page.evaluate(state=>{hassFixture.states['sensor.demo_uv'].state=state;hassFixture.states['sensor.demo_uv_status'].state=state;card.hass={...hassFixture};},state);
      assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('[data-role=tile-phase]').textContent),dictionaries['zh-Hant']['Purifying']);
      assert.ok(!(await page.evaluate(()=>card.shadowRoot.querySelector('[data-role=tile-context]').textContent)).includes(dictionaries['zh-Hant'][key]));
    }
  });
  await test('Unknown firmware values and hostile names/units are escaped, never translated or executed',async()=>{
    const hostile='<img src="https://invalid.example/x" onerror="window.i18nXss=true">';
    const raw='vendor_unknown_state_<script>alert(1)</script>';
    await page.evaluate(({hostile,raw})=>{clearFixture();setLanguage('ja');hassFixture.states['sensor.demo_phase'].state=raw;hassFixture.states['sensor.demo_fault'].state='none';hassFixture.states['sensor.demo_filter'].state=raw;hassFixture.states['sensor.demo_product_tds'].attributes.unit_of_measurement=hostile;window.card=makeCard('water-purifier-card',{title:hostile,filters:[{name:'<svg onload="window.i18nXss=true">',entity:'sensor.demo_filter',stage:'pp'}]});window.editor=makeEditor({title:hostile});},{hostile,raw});
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('h2').textContent),hostile);
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('[data-role=status]').textContent),raw);
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('[data-filter-value="0"]').textContent),raw);
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelector('[data-unit=product_tds]').textContent),hostile);
    assert.equal(await page.evaluate(()=>card.shadowRoot.querySelectorAll('img,script,[onload],[onerror]').length),0);
    assert.equal(await page.evaluate(()=>editor.shadowRoot.querySelectorAll('img,script,[onload],[onerror]').length),0);
    assert.equal(await page.evaluate(()=>window.i18nXss),undefined);
  });
  await test('No browser exceptions or external network attempts',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
  await fs.mkdir(path.dirname(reportPath),{recursive:true});
  await fs.writeFile(reportPath,JSON.stringify({scope:'Synthetic HA, local-only browser; no real HA or device connection',engine,browser:browser.version(),sourceSha256:sourceHash,catalogKeys:Object.keys(dictionaries.en).length,languages,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,errors,external,results},null,2)+'\n');
  if(results.some(r=>!r.passed))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
