/* Synthetic demonstration data only. HACS installs the card file, not this preview. */
(() => {
  'use strict';
  const variants = {
    small:{tag:'water-purifier-status-card',name:'Small status card',historyHours:1},
    medium:{tag:'water-purifier-history-card',name:'Medium history card',historyHours:6},
    full:{tag:'water-purifier-card',name:'Full water-circuit card',historyHours:1}
  };
  const editor = document.getElementById('editor');
  const deviceId = 'demo-water-device';
  const waterId = 'water_000000000001'; // Synthetic ID, not a real board identifier.
  const measurements = {
    phase:['producing','Control state'],fault:['none','Fault'],outputs:['runtime_commands','Output capability'],uptime:['183240','Uptime','s'],
    feed_tds:['186','Feed TDS','ppm'],product_tds:['8','Product TDS','ppm'],feed_temperature:['19.2','Feed temperature','°C'],product_temperature:['18.6','Product temperature','°C'],
    product_flow_rate:['0.42','Product flow','L/min'],waste_flow_rate:['0.18','Concentrate flow','L/min'],product_water_total:['248.6','Product total','L'],waste_water_total:['106.5','Concentrate total','L'],recovery_ratio:['70','RO recovery','%'],
    pump_v:['24.1','Pump voltage (uncalibrated)','V'],pump_a:['1.12','Pump current (uncalibrated)','A'],uv_v:['23.8','UVC voltage (uncalibrated)','V'],uv_a:['0.096','UVC current (uncalibrated)','A'],
    uv_enabled:['enabled','UV LED enabled'],uv_command:['commanded_on','UV LED output command'],uv_status:['commanded_on','UV LED status'],
    production_hours:['18.4','Commanded production time','h'],starts:['142','Production starts'],faults:['2','Fault count'],
    filter_1:['due','Filter 1 reminder'],filter_2:['within_limits','Filter 2 reminder'],filter_3:['within_limits','Filter 3 reminder'],filter_4:['within_limits','Filter 4 reminder'],filter_5:['within_limits','Filter 5 reminder'],
    filter_6:['not_fitted','Filter 6 reminder'],filter_7:['not_fitted','Filter 7 reminder'],filter_8:['not_fitted','Filter 8 reminder']
  };
  const idFor = key => 'sensor.demo_' + key;
  const devices = [{id:deviceId,name:'Kitchen water · demo',identifiers:[['mqtt',waterId]]}];
  const entries = Object.keys(measurements).map(key => ({entity_id:idFor(key),device_id:deviceId,platform:'mqtt',unique_id:waterId + '_' + key,disabled_by:null}));
  const stageKeys = ['pp','udf','cto','ro','post'];
  const filterNames = ['PP','UDF','CTO','RO','T33'];
  const flowKeys = ['flow','waste_flow','water_total','waste_total','recovery'];
  const configs = Object.fromEntries(Object.entries(variants).map(([layout,variant]) => [layout,{
    type:'custom:' + variant.tag,language:'auto',device_id:deviceId,layout,animate:true,show_history:true,history_hours:variant.historyHours,entities:{},
    stages:Object.fromEntries(stageKeys.map((stage,i) => [stage,idFor('filter_' + (i + 1))])),
    filters:filterNames.map((name,i) => ({name,entity:idFor('filter_' + (i + 1)),stage:stageKeys[i]}))
  }]));
  const hiddenFlow = new Map();
  const cards = Object.fromEntries(Object.keys(variants).map(layout => [layout,document.getElementById('card-' + layout)]));
  const connection = new EventTarget();
  connection.connected = true;
  connection.subscribeEvents = async () => () => {};
  let selected = 'medium',hass;

  // Local stand-in for HA's read-only history API. This never fetches a URL.
  async function historyResponse(method,path) {
    if (method !== 'GET' || !path.startsWith('history/period/')) throw new Error('Demo supports read-only history requests.');
    const mode = document.getElementById('history-mode').value;
    if (mode === 'error') throw new Error('Example: Home Assistant history is unavailable.');
    if (mode === 'empty') return [];
    const [route,query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    const ids = (params.get('filter_entity_id') ?? idFor('product_tds')).split(',');
    if (!ids.includes(idFor('product_tds'))) return [];
    const requestedEnd = Date.parse(params.get('end_time'));
    const now = Number.isFinite(requestedEnd) ? requestedEnd : Date.now();
    const requestedStart = Date.parse(decodeURIComponent(route.slice('history/period/'.length)));
    const start = Number.isFinite(requestedStart) ? Math.max(now - 86400000,Math.min(requestedStart,now - 60000)) : now - 3600000;
    const rows = [],count = 60;
    const currentState = hass?.states[idFor('product_tds')]?.state ?? 'unknown';
    const values = [12,11,10,10.5,11,10,9,9.5,10,9,8,8,8];
    for (let i = 0;i <= count;i++) {
      const date = new Date(start + (now - start) * i / count).toISOString();
      rows.push({entity_id:idFor('product_tds'),state:mode === 'gap' && i >= 25 && i < 32 ? 'unavailable' : i === count ? currentState : String(values[Math.floor(i / count * (values.length - 1))]),
        attributes:{friendly_name:'Product TDS · synthetic history',unit_of_measurement:'ppm'},last_changed:date,last_updated:date});
    }
    return [rows];
  }

  function stateSnapshot() {
    const scenario = document.getElementById('scenario').value;
    const filterMode = document.getElementById('filter-mode').value;
    const states = {},stamp = new Date().toISOString();
    for (const [key,[value,name,unit]] of Object.entries(measurements)) {
      let state = scenario === 'unavailable' ? 'unavailable' : value;
      if (scenario !== 'unavailable') {
        if (key === 'phase') state = ['producing','idle','flushing','fault'].includes(scenario) ? scenario : 'producing';
        if (key === 'fault' && scenario === 'fault') state = 'uv_undercurrent';
        if (['product_flow_rate','waste_flow_rate'].includes(key) && ['idle','fault'].includes(scenario)) state = '0';
        if (key === 'product_flow_rate' && scenario === 'flushing') state = '0';
        if (key === 'recovery_ratio' && ['idle','fault','flushing'].includes(scenario)) state = 'unknown';
        if (key === 'pump_a' && ['idle','fault'].includes(scenario)) state = '0';
        if (['idle','fault','flushing','uv-disabled'].includes(scenario)) {
          if (key === 'uv_command') state = 'off';
          if (key === 'uv_status') state = scenario === 'fault' ? 'uv_undercurrent' : scenario === 'uv-disabled' ? 'disabled' : 'off';
          if (key === 'uv_a') state = '0';
        }
        if (key === 'uv_enabled' && scenario === 'uv-disabled') state = 'disabled';
        if (key === 'product_tds' && scenario === 'unknown') state = 'unknown';
        if (/^filter_[1-5]$/.test(key)) {
          if (filterMode === 'within') state = 'within_limits';
          if (filterMode === 'disabled') state = 'disabled';
          if (filterMode === 'unknown') state = 'unknown';
          if (filterMode === 'incomplete') state = key === 'filter_1' ? 'not_installed' : key === 'filter_2' ? 'calendar_unknown' : 'within_limits';
        }
      }
      const updated = key === 'product_tds' && ['idle','fault'].includes(scenario) ? new Date(Date.now() - 600000).toISOString() : stamp;
      states[idFor(key)] = {entity_id:idFor(key),state,attributes:{friendly_name:name,...(unit ? {unit_of_measurement:unit} : {})},last_changed:updated,last_updated:updated};
    }
    if (scenario === 'missing') delete states[idFor('product_tds')];
    const language = document.getElementById('ha-language').value;
    const locale = {language,number_format:document.getElementById('number-format').value,time_format:document.getElementById('time-format').value,time_zone:document.getElementById('time-zone').value};
    return {connected:scenario !== 'disconnected',connection,states,language,locale,config:{time_zone:'Europe/Berlin'},callApi:historyResponse,callWS:async message => {
      if (message.type === 'config/device_registry/list') return devices;
      if (message.type === 'config/entity_registry/list') return entries;
      throw new Error('Demo supports registry reads only.');
    }};
  }

  function syncControls(updateEditor = true) {
    const config = configs[selected];
    document.getElementById('selected-card').value = selected;
    document.getElementById('editor-target').textContent = variants[selected].name;
    document.getElementById('animate').checked = config.animate;
    document.getElementById('hide-flow').checked = flowKeys.every(key => config.entities?.[key] === null);
    const hours = document.getElementById('history-hours');
    // The editor allows any 1–24 h window, not only the three convenient presets.
    hours.querySelectorAll('[data-custom-hour]').forEach(option => option.remove());
    if (![...hours.options].some(option => Number(option.value) === config.history_hours)) {
      const option = document.createElement('option');option.value = String(config.history_hours);option.textContent = config.history_hours + ' hours';option.dataset.customHour = '';hours.append(option);
    }
    hours.value = String(config.history_hours);hours.disabled = selected === 'small';
    document.querySelectorAll('[data-edit]').forEach(button => {
      const active = button.dataset.edit === selected;
      button.setAttribute('aria-pressed',String(active));button.textContent = active ? 'Editing this card' : 'Edit this card';
    });
    if (updateEditor) {editor.setConfig(config);if (hass) editor.hass = hass;}
  }

  function refresh(reconfigure = []) {
    const wasConnected = connection.connected;
    connection.connected = document.getElementById('scenario').value !== 'disconnected';
    hass = stateSnapshot();
    for (const [layout,card] of Object.entries(cards)) {
      card.hass = hass;
      if (reconfigure.includes(layout)) card.setConfig(configs[layout]);
    }
    editor.hass = hass;
    if (wasConnected !== connection.connected) connection.dispatchEvent(new Event(connection.connected ? 'ready' : 'disconnected'));
  }

  function selectCard(layout) {
    if (!variants[layout]) return;
    selected = layout;syncControls();
  }

  function commitSelected(change) {
    configs[selected] = {...configs[selected],...change};
    refresh([selected]);syncControls();
  }

  function start() {
    for (const id of ['ha-language','number-format','time-format','time-zone']) document.getElementById(id).onchange = () => refresh();
    document.getElementById('scenario').onchange = () => refresh(Object.keys(variants));
    document.getElementById('filter-mode').onchange = () => refresh();
    document.getElementById('history-mode').onchange = () => refresh(Object.keys(variants));
    document.getElementById('preview-width').onchange = event => {document.getElementById('preview-gallery').dataset.width = event.target.value;};
    document.getElementById('selected-card').onchange = event => selectCard(event.target.value);
    document.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click',() => selectCard(button.dataset.edit)));
    document.getElementById('dark').onchange = event => document.body.classList.toggle('dark',event.target.checked);
    document.getElementById('animate').onchange = event => commitSelected({animate:event.target.checked});
    document.getElementById('history-hours').onchange = event => commitSelected({history_hours:Number(event.target.value)});
    document.getElementById('hide-flow').onchange = event => {
      const entities = {...configs[selected].entities};
      if (event.target.checked) {
        hiddenFlow.set(selected,Object.fromEntries(flowKeys.filter(key => Object.prototype.hasOwnProperty.call(entities,key)).map(key => [key,entities[key]])));
        for (const key of flowKeys) entities[key] = null;
      } else {
        const previous = hiddenFlow.get(selected) ?? {};
        for (const key of flowKeys) {if (Object.prototype.hasOwnProperty.call(previous,key)) entities[key] = previous[key];else delete entities[key];}
        hiddenFlow.delete(selected);
      }
      commitSelected({entities});
    };
    editor.addEventListener('config-changed',event => {
      const next = event.detail.config;
      const layout = next.layout === 'compact' ? 'small' : next.layout;
      if (!variants[layout]) return;
      configs[layout] = {...next,layout,type:'custom:' + variants[layout].tag};
      selected = layout;refresh([layout]);syncControls(false);
      // Keep the shared editor associated with this fixed gallery slot/type.
      if (next.type !== configs[layout].type) editor.setConfig(configs[layout]);
    });
    for (const [layout,card] of Object.entries(cards)) card.addEventListener('hass-more-info',event => {
      const id = event.detail.entityId,obj = hass?.states[id];
      document.getElementById('info').textContent = 'DEMO ENTITY · ' + variants[layout].name + '\n' + id + '\n\n' + (obj?.attributes.friendly_name ?? '') + '\nState: ' + (obj?.state ?? 'not found') + (obj?.attributes.unit_of_measurement ? ' ' + obj.attributes.unit_of_measurement : '') + '\n\nNo service call is sent.';
    });
    refresh(Object.keys(variants));syncControls();
  }

  const missing = Object.values(variants).some(variant => !customElements.get(variant.tag)) || !customElements.get('water-purifier-card-editor');
  if (missing) {
    const error = document.getElementById('load-error');
    error.hidden = false;error.textContent = 'The three-card resource is not loaded. Replace water-purifier-card.js with v0.4.0 and reload this preview.';
  } else start();
})();
