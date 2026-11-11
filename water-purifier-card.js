/* Water Purifier Cards v0.4.0 — MIT — no runtime dependencies or build step. */
(() => {
  'use strict';
  const VERSION = '0.4.0';
  const TAG = 'water-purifier-card';
  const STATUS_TAG = 'water-purifier-status-card';
  const HISTORY_TAG = 'water-purifier-history-card';
  const CARD_LAYOUTS = {[TAG]:'full',[STATUS_TAG]:'small',[HISTORY_TAG]:'medium'};
  const FIELDS = [
    ['state', 'Control state', 'phase', '', 'text'],
    ['fault', 'Fault', 'fault', '', 'text'],
    ['feed_tds', 'Feed water', 'feed_tds', 'ppm', 'number'],
    ['product_tds', 'Product water', 'product_tds', 'ppm', 'number'],
    ['feed_temperature', 'Feed temperature', 'feed_temperature', '°C', 'number'],
    ['product_temperature', 'Product temperature', 'product_temperature', '°C', 'number'],
    ['flow', 'Product flow', 'product_flow_rate', 'L/min', 'number'],
    ['waste_flow', 'Concentrate flow', 'waste_flow_rate', 'L/min', 'number'],
    ['water_total', 'Product total', 'product_water_total', 'L', 'number'],
    ['waste_total', 'Concentrate total', 'waste_water_total', 'L', 'number'],
    ['recovery', 'RO recovery', 'recovery_ratio', '%', 'number'],
    ['production_hours', 'Production time', 'production_hours', 'h', 'number'],
    ['uptime', 'Uptime', 'uptime', 's', 'number'],
    ['outputs', 'Output capability', 'outputs', '', 'text'],
    ['pump_voltage', 'Pump voltage · uncalibrated', 'pump_v', 'V', 'number'],
    ['pump_current', 'Pump current · uncalibrated', 'pump_a', 'A', 'number'],
    ['uv_voltage', 'UVC voltage · uncalibrated', 'uv_v', 'V', 'number'],
    ['uv_current', 'UVC current · uncalibrated', 'uv_a', 'A', 'number'],
    ['starts', 'Production starts', 'starts', '', 'number'],
    ['faults', 'Fault count', 'faults', '', 'number'],
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => ['filter_' + n, 'Filter ' + n + ' reminder', 'filter_' + n, '', 'text']),
    ['pump', 'Booster pump', null, '', 'text'],
    ['inlet', 'Inlet valve', null, '', 'text'],
    ['flush', 'Flush valve', null, '', 'text'],
    ['uv', 'UV output command', 'uv_command', '', 'text'],
    ['uv_enabled', 'UV installed and enabled', 'uv_enabled', '', 'text'],
    ['uv_status', 'UV controller status', 'uv_status', '', 'text'],
    ['pressure', 'Pressure', null, '', 'number'],
    ['leak', 'Leak detector', null, '', 'text']
  ].map(([key, label, suffix, unit, kind]) => ({key, label, suffix, unit, kind}));
  const FIELD = Object.fromEntries(FIELDS.map(f => [f.key, f]));
  const STAGES = {
    pp: ['PP', 'Sediment prefilter'], udf: ['UDF', 'Granular carbon prefilter'],
    cto: ['CTO', 'Carbon block prefilter'], ro: ['RO', 'Reverse osmosis membrane'],
    post: ['T33', 'Post carbon filter']
  };
  const TEXT = {
    locked: 'Installation required', idle: 'Idle', preparing: 'Opening inlet', preflush: 'Preflushing',
    producing: 'Purifying', postflush: 'Postflushing', fault: 'Fault', maintenance: 'Maintenance',
    flushing: 'Flushing', testing: 'Output test', none: 'No fault', disabled: 'Disabled',
    not_installed: 'Replacement not recorded', due: 'Replacement due', calendar_unknown: 'Date unknown',
    within_limits: 'In service', not_fitted: 'Not fitted', commanded_on: 'Commanded on', enabled: 'Enabled',
    runtime_commands: 'Controller outputs permitted', locked_off: 'Outputs locked',
    configuration: 'Configuration fault', clock: 'Clock fault', deadline: 'Control deadline missed',
    invalid_input: 'Invalid input', stale_input: 'Stale input', no_supply: 'No water supply',
    external_trip: 'Protection input active', cycle_timeout: 'Cycle time exceeded', on: 'On', off: 'Off',
    uv_undercurrent: 'UV current below limit', uv_overcurrent: 'UV current above limit',
    uv_unexpected_current: 'Unexpected current while UV is off', uv_sensor: 'UV electrical feedback unavailable',
    uv_configuration: 'UV configuration required', feedback_unavailable: 'UV feedback unavailable',
    configuration_required: 'UV configuration required'
  };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const entityId = v => typeof v === 'string' && /^(sensor|binary_sensor|switch|input_boolean|input_number|input_select|input_text)\.[a-z0-9_]+$/.test(v);
  const LOCALES = {
  "en": {
    "Water purifier": "Water purifier",
    "Control state": "Control state",
    "Fault": "Fault",
    "Feed water": "Feed water",
    "Product water": "Product water",
    "Feed temperature": "Feed temperature",
    "Product temperature": "Product temperature",
    "Product flow": "Product flow",
    "Concentrate flow": "Concentrate flow",
    "Product total": "Product total",
    "Concentrate total": "Concentrate total",
    "RO recovery": "RO recovery",
    "Production time": "Production time",
    "Uptime": "Uptime",
    "Output capability": "Output capability",
    "Pump voltage · uncalibrated": "Pump voltage · uncalibrated",
    "Pump current · uncalibrated": "Pump current · uncalibrated",
    "UVC voltage · uncalibrated": "UVC voltage · uncalibrated",
    "UVC current · uncalibrated": "UVC current · uncalibrated",
    "Production starts": "Production starts",
    "Fault count": "Fault count",
    "Filter {count} reminder": "Filter {count} reminder",
    "Booster pump": "Booster pump",
    "Inlet valve": "Inlet valve",
    "Flush valve": "Flush valve",
    "UV output command": "UV output command",
    "UV installed and enabled": "UV installed and enabled",
    "UV controller status": "UV controller status",
    "Pressure": "Pressure",
    "Leak detector": "Leak detector",
    "Sediment prefilter": "Sediment prefilter",
    "Granular carbon prefilter": "Granular carbon prefilter",
    "Carbon block prefilter": "Carbon block prefilter",
    "Reverse osmosis membrane": "Reverse osmosis membrane",
    "Post carbon filter": "Post carbon filter",
    "Installation required": "Installation required",
    "Idle": "Idle",
    "Opening inlet": "Opening inlet",
    "Preflushing": "Preflushing",
    "Purifying": "Purifying",
    "Postflushing": "Postflushing",
    "Maintenance": "Maintenance",
    "Flushing": "Flushing",
    "Output test": "Output test",
    "No fault": "No fault",
    "Disabled": "Disabled",
    "Replacement not recorded": "Replacement not recorded",
    "Replacement due": "Replacement due",
    "Date unknown": "Date unknown",
    "In service": "In service",
    "Not fitted": "Not fitted",
    "Commanded on": "Commanded on",
    "Enabled": "Enabled",
    "Controller outputs permitted": "Controller outputs permitted",
    "Outputs locked": "Outputs locked",
    "Configuration fault": "Configuration fault",
    "Clock fault": "Clock fault",
    "Control deadline missed": "Control deadline missed",
    "Invalid input": "Invalid input",
    "Stale input": "Stale input",
    "No water supply": "No water supply",
    "Protection input active": "Protection input active",
    "Cycle time exceeded": "Cycle time exceeded",
    "On": "On",
    "Off": "Off",
    "UV current below limit": "UV current below limit",
    "UV current above limit": "UV current above limit",
    "Unexpected current while UV is off": "Unexpected current while UV is off",
    "UV electrical feedback unavailable": "UV electrical feedback unavailable",
    "UV configuration required": "UV configuration required",
    "UV feedback unavailable": "UV feedback unavailable",
    "{name} must be a mapping.": "{name} must be a mapping.",
    "Unknown {name} key: {key}": "Unknown {name} key: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: select an entity ID, or null to hide it.",
    "Card configuration must be an object.": "Card configuration must be an object.",
    "Choose a Water Purifier full, status or history card type.": "Choose a Water Purifier full, status or history card type.",
    "Title must be at most 100 characters.": "Title must be at most 100 characters.",
    "Layout must be full, small or medium.": "Layout must be full, small or medium.",
    "{name} must be true or false.": "{name} must be true or false.",
    "history_hours must be an integer from 1 to 24.": "history_hours must be an integer from 1 to 24.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url must be an http:// or https:// URL without credentials.",
    "device_id must be a Home Assistant device registry ID.": "device_id must be a Home Assistant device registry ID.",
    "filters must be an array with at most eight entries.": "filters must be an array with at most eight entries.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "Filter {count} needs a name (1–60 characters) and an entity ID.",
    "Filter stage must be pp, udf, cto, ro, or post.": "Filter stage must be pp, udf, cto, ro, or post.",
    "Choose a supported language, or auto to follow Home Assistant.": "Choose a supported language, or auto to follow Home Assistant.",
    "Not mapped": "Not mapped",
    "HA disconnected": "HA disconnected",
    "Entity not found": "Entity not found",
    "Unavailable": "Unavailable",
    "Unknown": "Unknown",
    "Device discovery is unavailable. Map entities manually.": "Device discovery is unavailable. Map entities manually.",
    "Unexpected registry response. Map entities manually.": "Unexpected registry response. Map entities manually.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "Selected device has no unique WATER MQTT identifier. Map entities manually.",
    "Could not discover entities. Use manual mappings.": "Could not discover entities. Use manual mappings.",
    "PP sediment filter": "PP sediment filter",
    "UDF granular carbon filter": "UDF granular carbon filter",
    "CTO carbon block filter": "CTO carbon block filter",
    "RO membrane": "RO membrane",
    "T33 post carbon filter": "T33 post carbon filter",
    "Waste valve": "Waste valve",
    "UV lamp": "UV lamp",
    "Concentrate": "Concentrate",
    "{name} details": "{name} details",
    "Inlet": "Inlet",
    "Pump": "Pump",
    "Feed": "Feed",
    "Product": "Product",
    "Water circuit diagram": "Water circuit diagram",
    "Water circuit": "Water circuit",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.",
    "Total produced": "Total produced",
    "Temperature": "Temperature",
    "UV fault": "UV fault",
    "UV commanded on": "UV commanded on",
    "UV commanded off": "UV commanded off",
    "UV disabled": "UV disabled",
    "UV setup required": "UV setup required",
    "UV status unknown": "UV status unknown",
    "Home Assistant disconnected": "Home Assistant disconnected",
    "Set up device": "Set up device",
    "Select a device or map its state": "Select a device or map its state",
    "State entity not found": "State entity not found",
    "Device state unavailable": "Device state unavailable",
    "Needs attention": "Needs attention",
    "Controller reports a fault": "Controller reports a fault",
    "Status unknown": "Status unknown",
    "Fault status unavailable": "Fault status unavailable",
    "Standby": "Standby",
    "Locked": "Locked",
    "Starting": "Starting",
    "Pre-rinse": "Pre-rinse",
    "Post-rinse": "Post-rinse",
    "Rinsing": "Rinsing",
    "Not producing": "Not producing",
    "Open controller for details": "Open controller for details",
    "Flow unavailable": "Flow unavailable",
    "Waste total": "Waste total",
    "Starts": "Starts",
    "Product TDS": "Product TDS",
    "Feed TDS": "Feed TDS",
    "Retry discovery": "Retry discovery",
    "Waiting": "Waiting",
    "Last {count} hours": "Last {count} hours",
    "Last hour": "Last hour",
    "History ↗": "History ↗",
    "Product TDS history": "Product TDS history",
    "Cumulative usage, independent of the chart time range": "Cumulative usage, independent of the chart time range",
    "Usage history": "Usage history",
    "Cumulative": "Cumulative",
    "{name} details, accumulated commanded production time": "{name} details, accumulated commanded production time",
    "Filter care": "Filter care",
    "Loading device entities…": "Loading device entities…",
    "Live": "Live",
    "Latest reading": "Latest reading",
    "Open details": "Open details",
    "Device data unavailable": "Device data unavailable",
    "Reminder off": "Reminder off",
    "{name} · Replacement due": "{name} · Replacement due",
    "Due: {count}": "Due: {count}",
    "Unknown: {count}": "Unknown: {count}",
    "Review": "Review",
    "Reminders are off": "Reminders are off",
    "{name} · Reminder off": "{name} · Reminder off",
    "Off: {count}": "Off: {count}",
    "No installed filters in this list": "No installed filters in this list",
    "No replacement reminders due": "No replacement reminders due",
    "Plans: {count}": "Plans: {count}",
    "Filter {count}": "Filter {count}",
    "Not configured": "Not configured",
    "Map product TDS to see water quality.": "Map product TDS to see water quality.",
    "WATER CIRCUIT": "WATER CIRCUIT",
    "Tap a component to inspect": "Tap a component to inspect",
    "Close component details": "Close component details",
    "More readings & diagnostics": "More readings & diagnostics",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Choose your WATER device in the card editor, or map Home Assistant entities.",
    "Waiting for Home Assistant": "Waiting for Home Assistant",
    "Open device dashboard ↗": "Open device dashboard ↗",
    "Controller details ↗": "Controller details ↗",
    "State not mapped": "State not mapped",
    "Device fault · {name}": "Device fault · {name}",
    "Controller stopped by a fault. Open state details.": "Controller stopped by a fault. Open state details.",
    "Purifying · tap to inspect": "Purifying · tap to inspect",
    "Flushing · tap to inspect": "Flushing · tap to inspect",
    "Service due": "Service due",
    "Service reminders: {count}": "Service reminders: {count}",
    "Review plan status": "Review plan status",
    "Filter plans: {count}": "Filter plans: {count}",
    "State unavailable": "State unavailable",
    "Updated just now": "Updated just now",
    "Updated {count} min ago": "Updated {count} min ago",
    "Via Home Assistant": "Via Home Assistant",
    "Waiting for history": "Waiting for history",
    "Loading history…": "Loading history…",
    "No recorded history": "No recorded history",
    "History unavailable": "History unavailable",
    "Live readings remain available.": "Live readings remain available.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.",
    "Recorded history · live reading unavailable": "Recorded history · live reading unavailable",
    "Gaps indicate unavailable readings": "Gaps indicate unavailable readings",
    "The mapped entity is not present in Home Assistant.": "The mapped entity is not present in Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "Assign a verified filter reminder to this stage in the card editor.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "No individual status entity is mapped. Controller phase does not prove the physical component state.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Automatic discovery unavailable. Manual entity mappings still work.",
    "{name} mapping mode": "{name} mapping mode",
    "From filter list": "From filter list",
    "Automatic": "Automatic",
    "Choose entity": "Choose entity",
    "Hide": "Hide",
    "{name} entity": "{name} entity",
    "Water quality & production": "Water quality & production",
    "Installed equipment & status": "Installed equipment & status",
    "Filter reminder entities": "Filter reminder entities",
    "Device diagnostics": "Device diagnostics",
    "Water Purifier Cards": "Water Purifier Cards",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.",
    "Device": "Device",
    "Manual entity mapping": "Manual entity mapping",
    "Saved device · {name}": "Saved device · {name}",
    "Refresh devices": "Refresh devices",
    "WATER devices found: {count}": "WATER devices found: {count}",
    "Title": "Title",
    "Card layout": "Card layout",
    "Large · Full water circuit": "Large · Full water circuit",
    "Small · Device status": "Small · Device status",
    "Medium · Quality & history": "Medium · Quality & history",
    "Device dashboard URL (optional)": "Device dashboard URL (optional)",
    "Animate water paths (large card)": "Animate water paths (large card)",
    "Show recorded TDS history (medium / large)": "Show recorded TDS history (medium / large)",
    "TDS history window (hours)": "TDS history window (hours)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.",
    "Physical filter → maintenance entity": "Physical filter → maintenance entity",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.",
    "Filter names & circuit stages": "Filter names & circuit stages",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.",
    "Use a custom list": "Use a custom list",
    "Name": "Name",
    "Entity": "Entity",
    "Circuit stage": "Circuit stage",
    "Not assigned": "Not assigned",
    "Remove filter {count}": "Remove filter {count}",
    "Add reminder": "Add reminder",
    "Save reminder list": "Save reminder list",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Choose a sensor, binary_sensor, switch or input helper entity.",
    "Filter reminder": "Filter reminder",
    "Language": "Language",
    "Follow Home Assistant": "Follow Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.",
    "Water Purifier · Full": "Water Purifier · Full",
    "Large card with the water circuit, readings, history and filter care.": "Large card with the water circuit, readings, history and filter care.",
    "Water Purifier · Status": "Water Purifier · Status",
    "Small home card: operating state, product TDS and flow.": "Small home card: operating state, product TDS and flow.",
    "Water Purifier · History": "Water Purifier · History",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders."
  },
  "zh-Hans": {
    "Water purifier": "净水器",
    "Control state": "运行状态",
    "Fault": "故障",
    "Feed water": "原水",
    "Product water": "纯水",
    "Feed temperature": "原水温度",
    "Product temperature": "纯水温度",
    "Product flow": "纯水流量",
    "Concentrate flow": "废水流量",
    "Product total": "累计纯水量",
    "Concentrate total": "累计废水量",
    "RO recovery": "RO 回收率",
    "Production time": "累计制水时间",
    "Uptime": "运行时间",
    "Output capability": "输出权限",
    "Pump voltage · uncalibrated": "水泵电压 · 未校准",
    "Pump current · uncalibrated": "水泵电流 · 未校准",
    "UVC voltage · uncalibrated": "UVC 电压 · 未校准",
    "UVC current · uncalibrated": "UVC 电流 · 未校准",
    "Production starts": "制水启动次数",
    "Fault count": "故障次数",
    "Filter {count} reminder": "滤芯 {count} 提醒",
    "Booster pump": "增压泵",
    "Inlet valve": "进水阀",
    "Flush valve": "冲洗阀",
    "UV output command": "UV 输出指令",
    "UV installed and enabled": "UV 已安装并启用",
    "UV controller status": "UV 控制状态",
    "Pressure": "压力",
    "Leak detector": "漏水探头",
    "Sediment prefilter": "前置沉积物滤芯",
    "Granular carbon prefilter": "前置颗粒活性炭滤芯",
    "Carbon block prefilter": "前置压缩活性炭滤芯",
    "Reverse osmosis membrane": "反渗透膜",
    "Post carbon filter": "后置活性炭滤芯",
    "Installation required": "需要配置安装信息",
    "Idle": "空闲",
    "Opening inlet": "正在打开进水阀",
    "Preflushing": "前冲洗",
    "Purifying": "制水中",
    "Postflushing": "后冲洗",
    "Maintenance": "维护中",
    "Flushing": "冲洗中",
    "Output test": "输出测试",
    "No fault": "无故障",
    "Disabled": "已禁用",
    "Replacement not recorded": "未登记安装或更换",
    "Replacement due": "需要更换",
    "Date unknown": "日期未知",
    "In service": "使用中",
    "Not fitted": "未安装",
    "Commanded on": "已下达开启指令",
    "Enabled": "已启用",
    "Controller outputs permitted": "允许控制器输出",
    "Outputs locked": "输出已锁定",
    "Configuration fault": "配置故障",
    "Clock fault": "时钟故障",
    "Control deadline missed": "控制执行超时",
    "Invalid input": "输入无效",
    "Stale input": "输入数据过期",
    "No water supply": "无供水信号",
    "Protection input active": "保护输入已触发",
    "Cycle time exceeded": "单次运行超时",
    "On": "开启",
    "Off": "关闭",
    "UV current below limit": "UV 电流低于下限",
    "UV current above limit": "UV 电流超过上限",
    "Unexpected current while UV is off": "UV 关闭时仍有异常电流",
    "UV electrical feedback unavailable": "UV 电气反馈不可用",
    "UV configuration required": "需要配置 UV",
    "UV feedback unavailable": "UV 反馈不可用",
    "{name} must be a mapping.": "{name} 必须为映射对象。",
    "Unknown {name} key: {key}": "未知的 {name} 字段：{key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}：请选择实体 ID，或设为 null 隐藏。",
    "Card configuration must be an object.": "卡片配置必须为对象。",
    "Choose a Water Purifier full, status or history card type.": "请选择净水器完整卡片、状态卡片或历史卡片类型。",
    "Title must be at most 100 characters.": "标题不能超过 100 个字符。",
    "Layout must be full, small or medium.": "布局必须为 full、small 或 medium。",
    "{name} must be true or false.": "{name} 必须为 true 或 false。",
    "history_hours must be an integer from 1 to 24.": "history_hours 必须为 1 到 24 的整数。",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url 必须为不含用户名或密码的 http:// 或 https:// 地址。",
    "device_id must be a Home Assistant device registry ID.": "device_id 必须为 Home Assistant 设备注册 ID。",
    "filters must be an array with at most eight entries.": "filters 必须为数组，最多包含八项。",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "滤芯 {count} 需要名称（1–60 个字符）和实体 ID。",
    "Filter stage must be pp, udf, cto, ro, or post.": "滤芯级别必须为 pp、udf、cto、ro 或 post。",
    "Choose a supported language, or auto to follow Home Assistant.": "请选择支持的语言，或设为 auto 跟随 Home Assistant。",
    "Not mapped": "未映射",
    "HA disconnected": "HA 已断开",
    "Entity not found": "找不到实体",
    "Unavailable": "不可用",
    "Unknown": "未知",
    "Device discovery is unavailable. Map entities manually.": "自动发现设备不可用，请手动映射实体。",
    "Unexpected registry response. Map entities manually.": "设备注册表响应异常，请手动映射实体。",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "所选设备没有唯一 WATER MQTT 标识，请手动映射实体。",
    "Could not discover entities. Use manual mappings.": "无法发现实体，请使用手动映射。",
    "PP sediment filter": "PP 沉积物滤芯",
    "UDF granular carbon filter": "UDF 颗粒活性炭滤芯",
    "CTO carbon block filter": "CTO 压缩活性炭滤芯",
    "RO membrane": "RO 膜",
    "T33 post carbon filter": "T33 后置活性炭滤芯",
    "Waste valve": "废水阀",
    "UV lamp": "UV 灯",
    "Concentrate": "废水",
    "{name} details": "{name}详情",
    "Inlet": "进水阀",
    "Pump": "水泵",
    "Feed": "原水",
    "Product": "纯水",
    "Water circuit diagram": "水路示意图",
    "Water circuit": "水路",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "水路：原水通过已配置的前置滤芯、进水阀和增压泵进入 RO 膜支路，纯水通过已配置的后置滤芯，废水从废水支路排出。",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "水路：原水通过已配置的前置滤芯、进水阀和增压泵进入 RO 膜支路，纯水通过已配置的后置滤芯和 UV 灯，废水从废水支路排出。",
    "Total produced": "累计产水量",
    "Temperature": "温度",
    "UV fault": "UV 故障",
    "UV commanded on": "UV 已下达开启指令",
    "UV commanded off": "UV 已下达关闭指令",
    "UV disabled": "UV 已禁用",
    "UV setup required": "UV 需要配置",
    "UV status unknown": "UV 状态未知",
    "Home Assistant disconnected": "Home Assistant 已断开",
    "Set up device": "配置设备",
    "Select a device or map its state": "选择设备或映射运行状态",
    "State entity not found": "找不到状态实体",
    "Device state unavailable": "设备状态不可用",
    "Needs attention": "需要关注",
    "Controller reports a fault": "控制器报告故障",
    "Status unknown": "状态未知",
    "Fault status unavailable": "故障状态不可用",
    "Standby": "待机",
    "Locked": "已锁定",
    "Starting": "启动中",
    "Pre-rinse": "前冲洗",
    "Post-rinse": "后冲洗",
    "Rinsing": "冲洗中",
    "Not producing": "当前未制水",
    "Open controller for details": "打开设备后台查看详情",
    "Flow unavailable": "流量不可用",
    "Waste total": "累计废水量",
    "Starts": "启动次数",
    "Product TDS": "纯水 TDS",
    "Feed TDS": "原水 TDS",
    "Retry discovery": "重新发现",
    "Waiting": "等待中",
    "Last {count} hours": "最近 {count} 小时",
    "Last hour": "最近一小时",
    "History ↗": "历史记录 ↗",
    "Product TDS history": "纯水 TDS 历史",
    "Cumulative usage, independent of the chart time range": "累计用量，与图表时间范围无关",
    "Usage history": "用量历史",
    "Cumulative": "累计",
    "{name} details, accumulated commanded production time": "{name}详情，累计制水指令持续时间",
    "Filter care": "滤芯维护",
    "Loading device entities…": "正在加载设备实体…",
    "Live": "实时",
    "Latest reading": "最新读数",
    "Open details": "打开详情",
    "Device data unavailable": "设备数据不可用",
    "Reminder off": "提醒已关闭",
    "{name} · Replacement due": "{name} · 需要更换",
    "Due: {count}": "到期：{count}",
    "Unknown: {count}": "未知：{count}",
    "Review": "请检查",
    "Reminders are off": "提醒已关闭",
    "{name} · Reminder off": "{name} · 提醒已关闭",
    "Off: {count}": "已关闭：{count}",
    "No installed filters in this list": "此列表中没有已安装的滤芯",
    "No replacement reminders due": "暂无到期更换提醒",
    "Plans: {count}": "计划数：{count}",
    "Filter {count}": "滤芯 {count}",
    "Not configured": "未配置",
    "Map product TDS to see water quality.": "映射纯水 TDS 实体以查看水质。",
    "WATER CIRCUIT": "水路监控",
    "Tap a component to inspect": "点击部件查看详情",
    "Close component details": "关闭部件详情",
    "More readings & diagnostics": "更多读数与诊断",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "此卡片只读。水流动画跟随控制器运行阶段，不代表实测流量或阀门反馈。UV 指令不证明消毒效果。滤芯提醒是设备上报的计划状态，不是估算剩余寿命。水路级别由卡片配置决定，MQTT 不上报滤芯类型或管路信息。历史数据来自 Home Assistant Recorder。",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "请在卡片编辑器选择 WATER 设备，或映射 Home Assistant 实体。",
    "Waiting for Home Assistant": "等待 Home Assistant",
    "Open device dashboard ↗": "打开设备后台 ↗",
    "Controller details ↗": "控制器详情 ↗",
    "State not mapped": "未映射运行状态",
    "Device fault · {name}": "设备故障 · {name}",
    "Controller stopped by a fault. Open state details.": "控制器因故障停止，请打开状态详情。",
    "Purifying · tap to inspect": "制水中 · 点击查看",
    "Flushing · tap to inspect": "冲洗中 · 点击查看",
    "Service due": "需要维护",
    "Service reminders: {count}": "维护提醒：{count}",
    "Review plan status": "检查计划状态",
    "Filter plans: {count}": "滤芯计划：{count}",
    "State unavailable": "状态不可用",
    "Updated just now": "刚刚更新",
    "Updated {count} min ago": "{count} 分钟前更新",
    "Via Home Assistant": "通过 Home Assistant",
    "Waiting for history": "等待历史数据",
    "Loading history…": "正在加载历史数据…",
    "No recorded history": "暂无历史记录",
    "History unavailable": "历史数据不可用",
    "Live readings remain available.": "实时读数仍可用。",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "纯水 TDS 历史趋势，从 {from} 到 {to}。空白处表示缺失读数。",
    "Recorded history · live reading unavailable": "历史记录 · 实时读数不可用",
    "Gaps indicate unavailable readings": "空白处表示读数不可用",
    "The mapped entity is not present in Home Assistant.": "Home Assistant 中不存在映射的实体。",
    "Assign a verified filter reminder to this stage in the card editor.": "请在卡片编辑器中为此级别关联已核实的滤芯提醒实体。",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "未映射独立状态实体。控制器运行阶段不能证明部件的实际状态。",
    "Automatic discovery unavailable. Manual entity mappings still work.": "自动发现不可用，仍可手动映射实体。",
    "{name} mapping mode": "{name}映射方式",
    "From filter list": "来自滤芯列表",
    "Automatic": "自动",
    "Choose entity": "选择实体",
    "Hide": "隐藏",
    "{name} entity": "{name}实体",
    "Water quality & production": "水质与制水",
    "Installed equipment & status": "已安装设备与状态",
    "Filter reminder entities": "滤芯提醒实体",
    "Device diagnostics": "设备诊断",
    "Water Purifier Cards": "净水器卡片",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "选择 WATER MQTT 设备或手动映射实体。三种尺寸的卡片共用实体配置和 JavaScript 资源。",
    "Device": "设备",
    "Manual entity mapping": "手动映射实体",
    "Saved device · {name}": "已保存的设备 · {name}",
    "Refresh devices": "刷新设备",
    "WATER devices found: {count}": "发现 WATER 设备：{count}",
    "Title": "标题",
    "Card layout": "卡片布局",
    "Large · Full water circuit": "大卡 · 完整水路",
    "Small · Device status": "小卡 · 设备状态",
    "Medium · Quality & history": "中卡 · 水质与历史",
    "Device dashboard URL (optional)": "设备后台地址（可选）",
    "Animate water paths (large card)": "显示水流动画（大卡）",
    "Show recorded TDS history (medium / large)": "显示 TDS 历史记录（中卡/大卡）",
    "TDS history window (hours)": "TDS 历史范围（小时）",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "小卡不请求历史数据。中卡用量为累计值，与 TDS 图表的时间范围无关。待机状态不表示自动运行已启用。",
    "Physical filter → maintenance entity": "实际滤芯 → 维护实体",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "固件支持八个提醒槽位，请对应实际安装的滤芯类型。这些指定的点击映射优先于下方的级别关联，不改变实际管路。",
    "Filter names & circuit stages": "滤芯名称与水路级别",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "为已安装滤芯命名并关联实际级别。若每项都关联了级别，水路只显示这些级别类型；否则保留五级参考水路。空列表只隐藏提醒。",
    "Use a custom list": "使用自定义列表",
    "Name": "名称",
    "Entity": "实体",
    "Circuit stage": "水路级别",
    "Not assigned": "未关联",
    "Remove filter {count}": "移除滤芯 {count}",
    "Add reminder": "添加提醒",
    "Save reminder list": "保存提醒列表",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "未映射的可选项会隐藏。已映射实体变为未知或不可用时仍显示。只有大卡包含水路图。所有卡片均不发送设备控制指令。",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "请选择 sensor、binary_sensor、switch 或输入辅助实体。",
    "Filter reminder": "滤芯提醒",
    "Language": "语言",
    "Follow Home Assistant": "跟随 Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "默认跟随 Home Assistant 个人资料中的语言，也可单独选择。自定义标题和滤芯名称保持原样。",
    "Water Purifier · Full": "净水器 · 完整",
    "Large card with the water circuit, readings, history and filter care.": "显示水路、读数、历史和滤芯维护的大卡。",
    "Water Purifier · Status": "净水器 · 状态",
    "Small home card: operating state, product TDS and flow.": "首页小卡：运行状态、纯水 TDS 和流量。",
    "Water Purifier · History": "净水器 · 历史",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "中卡：水质、TDS 历史趋势、累计用量和滤芯提醒。"
  },
  "de": {
    "Water purifier": "Wasseraufbereiter",
    "Control state": "Steuerungszustand",
    "Fault": "Störung",
    "Feed water": "Rohwasser",
    "Product water": "Reinwasser",
    "Feed temperature": "Rohwassertemperatur",
    "Product temperature": "Reinwassertemperatur",
    "Product flow": "Reinwasserfluss",
    "Concentrate flow": "Konzentratfluss",
    "Product total": "Reinwasser gesamt",
    "Concentrate total": "Konzentrat gesamt",
    "RO recovery": "RO-Wasserausbeute",
    "Production time": "Produktionszeit",
    "Uptime": "Betriebszeit",
    "Output capability": "Ausgangsfreigabe",
    "Pump voltage · uncalibrated": "Pumpenspannung · unkalibriert",
    "Pump current · uncalibrated": "Pumpenstrom · unkalibriert",
    "UVC voltage · uncalibrated": "UVC-Spannung · unkalibriert",
    "UVC current · uncalibrated": "UVC-Strom · unkalibriert",
    "Production starts": "Produktionsstarts",
    "Fault count": "Störungsanzahl",
    "Filter {count} reminder": "Erinnerung Filter {count}",
    "Booster pump": "Druckerhöhungspumpe",
    "Inlet valve": "Einlassventil",
    "Flush valve": "Spülventil",
    "UV output command": "UV-Ausgangsbefehl",
    "UV installed and enabled": "UV installiert und aktiviert",
    "UV controller status": "UV-Steuerungsstatus",
    "Pressure": "Druck",
    "Leak detector": "Lecksensor",
    "Sediment prefilter": "Sedimentvorfilter",
    "Granular carbon prefilter": "Aktivkohlegranulat-Vorfilter",
    "Carbon block prefilter": "Aktivkohleblock-Vorfilter",
    "Reverse osmosis membrane": "Umkehrosmosemembran",
    "Post carbon filter": "Aktivkohle-Nachfilter",
    "Installation required": "Einrichtung erforderlich",
    "Idle": "Im Leerlauf",
    "Opening inlet": "Einlass wird geöffnet",
    "Preflushing": "Vorspülung",
    "Purifying": "Wasseraufbereitung",
    "Postflushing": "Nachspülung",
    "Maintenance": "Wartung",
    "Flushing": "Spülung",
    "Output test": "Ausgangstest",
    "No fault": "Keine Störung",
    "Disabled": "Deaktiviert",
    "Replacement not recorded": "Wechsel nicht erfasst",
    "Replacement due": "Wechsel fällig",
    "Date unknown": "Datum unbekannt",
    "In service": "In Gebrauch",
    "Not fitted": "Nicht eingebaut",
    "Commanded on": "Einschalten angefordert",
    "Enabled": "Aktiviert",
    "Controller outputs permitted": "Steuerungsausgänge freigegeben",
    "Outputs locked": "Ausgänge gesperrt",
    "Configuration fault": "Konfigurationsfehler",
    "Clock fault": "Uhrfehler",
    "Control deadline missed": "Steuerungsfrist überschritten",
    "Invalid input": "Ungültiger Eingang",
    "Stale input": "Veralteter Eingangswert",
    "No water supply": "Keine Wasserversorgung",
    "Protection input active": "Schutzeingang aktiv",
    "Cycle time exceeded": "Zyklusdauer überschritten",
    "On": "Ein",
    "Off": "Aus",
    "UV current below limit": "UV-Strom unter Grenzwert",
    "UV current above limit": "UV-Strom über Grenzwert",
    "Unexpected current while UV is off": "Unerwarteter Strom bei ausgeschaltetem UV",
    "UV electrical feedback unavailable": "Elektrische UV-Rückmeldung nicht verfügbar",
    "UV configuration required": "UV-Konfiguration erforderlich",
    "UV feedback unavailable": "UV-Rückmeldung nicht verfügbar",
    "{name} must be a mapping.": "{name} muss eine Zuordnung sein.",
    "Unknown {name} key: {key}": "Unbekannter Schlüssel in {name}: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: Entitäts-ID wählen oder mit null ausblenden.",
    "Card configuration must be an object.": "Die Kartenkonfiguration muss ein Objekt sein.",
    "Choose a Water Purifier full, status or history card type.": "Eine Water-Purifier-Karte vom Typ full, status oder history wählen.",
    "Title must be at most 100 characters.": "Der Titel darf höchstens 100 Zeichen enthalten.",
    "Layout must be full, small or medium.": "Das Layout muss full, small oder medium sein.",
    "{name} must be true or false.": "{name} muss true oder false sein.",
    "history_hours must be an integer from 1 to 24.": "history_hours muss eine ganze Zahl von 1 bis 24 sein.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url muss eine http://- oder https://-URL ohne Zugangsdaten sein.",
    "device_id must be a Home Assistant device registry ID.": "device_id muss eine Geräte-Registry-ID von Home Assistant sein.",
    "filters must be an array with at most eight entries.": "filters muss ein Array mit höchstens acht Einträgen sein.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "Filter {count} benötigt einen Namen (1–60 Zeichen) und eine Entitäts-ID.",
    "Filter stage must be pp, udf, cto, ro, or post.": "Die Filterstufe muss pp, udf, cto, ro oder post sein.",
    "Choose a supported language, or auto to follow Home Assistant.": "Eine unterstützte Sprache wählen oder auto, um Home Assistant zu folgen.",
    "Not mapped": "Nicht zugeordnet",
    "HA disconnected": "HA getrennt",
    "Entity not found": "Entität nicht gefunden",
    "Unavailable": "Nicht verfügbar",
    "Unknown": "Unbekannt",
    "Device discovery is unavailable. Map entities manually.": "Geräteerkennung nicht verfügbar. Entitäten manuell zuordnen.",
    "Unexpected registry response. Map entities manually.": "Unerwartete Registry-Antwort. Entitäten manuell zuordnen.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "Das gewählte Gerät hat keine eindeutige WATER-MQTT-Kennung. Entitäten manuell zuordnen.",
    "Could not discover entities. Use manual mappings.": "Entitäten konnten nicht erkannt werden. Manuelle Zuordnungen verwenden.",
    "PP sediment filter": "PP-Sedimentfilter",
    "UDF granular carbon filter": "UDF-Aktivkohlegranulatfilter",
    "CTO carbon block filter": "CTO-Aktivkohleblockfilter",
    "RO membrane": "RO-Membran",
    "T33 post carbon filter": "T33-Aktivkohle-Nachfilter",
    "Waste valve": "Konzentratventil",
    "UV lamp": "UV-Lampe",
    "Concentrate": "Konzentrat",
    "{name} details": "Details zu {name}",
    "Inlet": "Einlass",
    "Pump": "Pumpe",
    "Feed": "Zulauf",
    "Product": "Reinwasser",
    "Water circuit diagram": "Wasserkreislaufdiagramm",
    "Water circuit": "Wasserkreislauf",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Wasserkreislauf. Rohwasser fließt durch die konfigurierten Vorfilter, den Einlass und die Pumpe zum Membranzweig. Reinwasser durchläuft den konfigurierten Nachfilter; Konzentrat verlässt den Kreislauf über den Konzentratablauf.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Wasserkreislauf. Rohwasser fließt durch die konfigurierten Vorfilter, den Einlass und die Pumpe zum Membranzweig. Reinwasser durchläuft den konfigurierten Nachfilter und die UV-Lampe; Konzentrat verlässt den Kreislauf über den Konzentratablauf.",
    "Total produced": "Produziert gesamt",
    "Temperature": "Temperatur",
    "UV fault": "UV-Störung",
    "UV commanded on": "UV-Einschaltung angefordert",
    "UV commanded off": "UV-Abschaltung angefordert",
    "UV disabled": "UV deaktiviert",
    "UV setup required": "UV-Einrichtung erforderlich",
    "UV status unknown": "UV-Status unbekannt",
    "Home Assistant disconnected": "Home Assistant getrennt",
    "Set up device": "Gerät einrichten",
    "Select a device or map its state": "Gerät auswählen oder Zustand zuordnen",
    "State entity not found": "Zustandsentität nicht gefunden",
    "Device state unavailable": "Gerätezustand nicht verfügbar",
    "Needs attention": "Prüfung erforderlich",
    "Controller reports a fault": "Steuerung meldet eine Störung",
    "Status unknown": "Status unbekannt",
    "Fault status unavailable": "Störungsstatus nicht verfügbar",
    "Standby": "Bereitschaft",
    "Locked": "Gesperrt",
    "Starting": "Startet",
    "Pre-rinse": "Vorspülung",
    "Post-rinse": "Nachspülung",
    "Rinsing": "Spült",
    "Not producing": "Keine Wasserproduktion",
    "Open controller for details": "Details in der Steuerung öffnen",
    "Flow unavailable": "Durchfluss nicht verfügbar",
    "Waste total": "Konzentrat gesamt",
    "Starts": "Starts",
    "Product TDS": "Reinwasser-TDS",
    "Feed TDS": "Rohwasser-TDS",
    "Retry discovery": "Erkennung wiederholen",
    "Waiting": "Warten",
    "Last {count} hours": "Letzte {count} Stunden",
    "Last hour": "Letzte Stunde",
    "History ↗": "Verlauf ↗",
    "Product TDS history": "Reinwasser-TDS-Verlauf",
    "Cumulative usage, independent of the chart time range": "Gesamtnutzung, unabhängig vom Diagrammzeitraum",
    "Usage history": "Nutzungsverlauf",
    "Cumulative": "Kumuliert",
    "{name} details, accumulated commanded production time": "Details zu {name}, kumulierte angeforderte Produktionszeit",
    "Filter care": "Filterwartung",
    "Loading device entities…": "Geräteentitäten werden geladen…",
    "Live": "Aktuell",
    "Latest reading": "Letzter Messwert",
    "Open details": "Details öffnen",
    "Device data unavailable": "Gerätedaten nicht verfügbar",
    "Reminder off": "Erinnerung aus",
    "{name} · Replacement due": "{name} · Wechsel fällig",
    "Due: {count}": "Fällig: {count}",
    "Unknown: {count}": "Unbekannt: {count}",
    "Review": "Prüfen",
    "Reminders are off": "Erinnerungen sind deaktiviert",
    "{name} · Reminder off": "{name} · Erinnerung aus",
    "Off: {count}": "Aus: {count}",
    "No installed filters in this list": "Keine eingebauten Filter in dieser Liste",
    "No replacement reminders due": "Kein Filterwechsel fällig",
    "Plans: {count}": "Pläne: {count}",
    "Filter {count}": "Filter {count}",
    "Not configured": "Nicht konfiguriert",
    "Map product TDS to see water quality.": "Reinwasser-TDS zuordnen, um die Wasserqualität anzuzeigen.",
    "WATER CIRCUIT": "WASSERKREISLAUF",
    "Tap a component to inspect": "Komponente für Details antippen",
    "Close component details": "Komponentendetails schließen",
    "More readings & diagnostics": "Weitere Messwerte und Diagnose",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Nur Anzeige. Die Wasseranimation folgt der Steuerungsphase und ist keine Durchfluss- oder Ventilrückmeldung. Der UV-Befehl bestätigt keine Desinfektion. Filtererinnerungen zeigen gemeldete Planzustände, keine geschätzte Restlebensdauer. Die Filterstufen folgen Ihrer Kartenkonfiguration; MQTT meldet weder Filtertypen noch Rohrverbindungen. Der Verlauf stammt aus Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Wählen Sie Ihr WATER-Gerät im Karteneditor oder ordnen Sie Home-Assistant-Entitäten zu.",
    "Waiting for Home Assistant": "Warten auf Home Assistant",
    "Open device dashboard ↗": "Geräte-Dashboard öffnen ↗",
    "Controller details ↗": "Steuerungsdetails ↗",
    "State not mapped": "Zustand nicht zugeordnet",
    "Device fault · {name}": "Gerätestörung · {name}",
    "Controller stopped by a fault. Open state details.": "Steuerung wegen einer Störung gestoppt. Zustandsdetails öffnen.",
    "Purifying · tap to inspect": "Wasseraufbereitung · für Details antippen",
    "Flushing · tap to inspect": "Spülung · für Details antippen",
    "Service due": "Wartung fällig",
    "Service reminders: {count}": "Wartungserinnerungen: {count}",
    "Review plan status": "Planstatus prüfen",
    "Filter plans: {count}": "Filterpläne: {count}",
    "State unavailable": "Zustand nicht verfügbar",
    "Updated just now": "Gerade aktualisiert",
    "Updated {count} min ago": "Vor {count} Min. aktualisiert",
    "Via Home Assistant": "Über Home Assistant",
    "Waiting for history": "Warten auf Verlauf",
    "Loading history…": "Verlauf wird geladen…",
    "No recorded history": "Kein aufgezeichneter Verlauf",
    "History unavailable": "Verlauf nicht verfügbar",
    "Live readings remain available.": "Aktuelle Messwerte bleiben verfügbar.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Aufgezeichneter Reinwasser-TDS-Verlauf. Von {from} bis {to}. Lücken kennzeichnen fehlende Messwerte.",
    "Recorded history · live reading unavailable": "Aufgezeichneter Verlauf · aktueller Messwert nicht verfügbar",
    "Gaps indicate unavailable readings": "Lücken kennzeichnen nicht verfügbare Messwerte",
    "The mapped entity is not present in Home Assistant.": "Die zugeordnete Entität ist in Home Assistant nicht vorhanden.",
    "Assign a verified filter reminder to this stage in the card editor.": "Ordnen Sie dieser Stufe im Karteneditor eine geprüfte Filtererinnerung zu.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "Keine eigene Zustandsentität zugeordnet. Die Steuerungsphase bestätigt nicht den tatsächlichen Zustand der Komponente.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Automatische Erkennung nicht verfügbar. Manuelle Entitätszuordnungen funktionieren weiterhin.",
    "{name} mapping mode": "Zuordnungsmodus für {name}",
    "From filter list": "Aus Filterliste",
    "Automatic": "Automatisch",
    "Choose entity": "Entität wählen",
    "Hide": "Ausblenden",
    "{name} entity": "Entität für {name}",
    "Water quality & production": "Wasserqualität und Produktion",
    "Installed equipment & status": "Installierte Geräte und Status",
    "Filter reminder entities": "Filtererinnerungs-Entitäten",
    "Device diagnostics": "Gerätediagnose",
    "Water Purifier Cards": "Wasseraufbereiter-Karten",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Wählen Sie ein WATER-MQTT-Gerät oder ordnen Sie Entitäten manuell zu. Alle drei Kartengrößen verwenden dieselben Entitätseinstellungen und dieselbe JavaScript-Ressource.",
    "Device": "Gerät",
    "Manual entity mapping": "Manuelle Entitätszuordnung",
    "Saved device · {name}": "Gespeichertes Gerät · {name}",
    "Refresh devices": "Geräte aktualisieren",
    "WATER devices found: {count}": "WATER-Geräte gefunden: {count}",
    "Title": "Titel",
    "Card layout": "Kartenlayout",
    "Large · Full water circuit": "Groß · Vollständiger Wasserkreislauf",
    "Small · Device status": "Klein · Gerätestatus",
    "Medium · Quality & history": "Mittel · Qualität und Verlauf",
    "Device dashboard URL (optional)": "Geräte-Dashboard-URL (optional)",
    "Animate water paths (large card)": "Wasserwege animieren (große Karte)",
    "Show recorded TDS history (medium / large)": "Aufgezeichneten TDS-Verlauf anzeigen (mittel/groß)",
    "TDS history window (hours)": "TDS-Verlaufszeitraum (Stunden)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "Die kleine Karte fragt keinen Verlauf ab. Die Nutzungssummen der mittleren Karte sind kumuliert und unabhängig vom Zeitraum des TDS-Diagramms. Bereitschaft bestätigt nicht, dass der Automatikbetrieb aktiviert ist.",
    "Physical filter → maintenance entity": "Physischer Filter → Wartungsentität",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "Die Firmware unterstützt acht Erinnerungsplätze. Ordnen Sie diese den eingebauten Filtertypen zu. Diese expliziten Klickzuordnungen haben Vorrang vor den folgenden Stufenzuordnungen; sie ändern keine Rohrverbindungen.",
    "Filter names & circuit stages": "Filternamen und Filterstufen",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Benennen Sie die eingebauten Filter und weisen Sie ihre tatsächlichen Stufen zu. Hat jeder Eintrag eine Stufe, erscheinen nur diese Stufentypen im Kreislauf. Andernfalls bleibt der fünfstufige Referenzkreislauf. Eine leere Liste blendet nur Erinnerungen aus.",
    "Use a custom list": "Benutzerdefinierte Liste verwenden",
    "Name": "Name",
    "Entity": "Entität",
    "Circuit stage": "Filterstufe",
    "Not assigned": "Nicht zugewiesen",
    "Remove filter {count}": "Filter {count} entfernen",
    "Add reminder": "Erinnerung hinzufügen",
    "Save reminder list": "Erinnerungsliste speichern",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Nicht zugeordnete optionale Elemente werden ausgelassen. Zugeordnete Entitäten bleiben bei unbekanntem oder nicht verfügbarem Zustand sichtbar. Nur die große Karte enthält einen Kreislauf. Keine Karte sendet Gerätebefehle.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Eine Entität vom Typ sensor, binary_sensor, switch oder Eingabehelfer wählen.",
    "Filter reminder": "Filtererinnerung",
    "Language": "Sprache",
    "Follow Home Assistant": "Home Assistant folgen",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "Die Sprache folgt Ihrem Home-Assistant-Profil, sofern Sie keine andere wählen. Eigene Titel und Filternamen bleiben unverändert.",
    "Water Purifier · Full": "Wasseraufbereiter · Vollansicht",
    "Large card with the water circuit, readings, history and filter care.": "Große Karte mit Wasserkreislauf, Messwerten, Verlauf und Filterwartung.",
    "Water Purifier · Status": "Wasseraufbereiter · Status",
    "Small home card: operating state, product TDS and flow.": "Kleine Übersichtskarte: Betriebszustand, Reinwasser-TDS und Durchfluss.",
    "Water Purifier · History": "Wasseraufbereiter · Verlauf",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Mittlere Karte: Wasserqualität, aufgezeichneter TDS-Verlauf, Gesamtnutzung und Filtererinnerungen."
  },
  "fr": {
    "Water purifier": "Purificateur d’eau",
    "Control state": "État du contrôleur",
    "Fault": "Défaut",
    "Feed water": "Eau d’entrée",
    "Product water": "Eau purifiée",
    "Feed temperature": "Température d’entrée",
    "Product temperature": "Température d’eau purifiée",
    "Product flow": "Débit d’eau purifiée",
    "Concentrate flow": "Débit de concentrat",
    "Product total": "Total d’eau purifiée",
    "Concentrate total": "Total de concentrat",
    "RO recovery": "Récupération d’eau RO",
    "Production time": "Durée de production",
    "Uptime": "Durée de fonctionnement",
    "Output capability": "Autorisation des sorties",
    "Pump voltage · uncalibrated": "Tension pompe · non étalonnée",
    "Pump current · uncalibrated": "Courant pompe · non étalonné",
    "UVC voltage · uncalibrated": "Tension UVC · non étalonnée",
    "UVC current · uncalibrated": "Courant UVC · non étalonné",
    "Production starts": "Démarrages de production",
    "Fault count": "Nombre de défauts",
    "Filter {count} reminder": "Rappel filtre {count}",
    "Booster pump": "Pompe de surpression",
    "Inlet valve": "Vanne d’entrée",
    "Flush valve": "Vanne de rinçage",
    "UV output command": "Commande de sortie UV",
    "UV installed and enabled": "UV installé et activé",
    "UV controller status": "État du contrôleur UV",
    "Pressure": "Pression",
    "Leak detector": "Détecteur de fuite",
    "Sediment prefilter": "Préfiltre à sédiments",
    "Granular carbon prefilter": "Préfiltre à charbon granulaire",
    "Carbon block prefilter": "Préfiltre à bloc de charbon",
    "Reverse osmosis membrane": "Membrane d’osmose inverse",
    "Post carbon filter": "Postfiltre à charbon",
    "Installation required": "Installation requise",
    "Idle": "Au repos",
    "Opening inlet": "Ouverture de l’entrée",
    "Preflushing": "Prérinçage",
    "Purifying": "Purification",
    "Postflushing": "Postrinçage",
    "Maintenance": "Maintenance",
    "Flushing": "Rinçage",
    "Output test": "Test des sorties",
    "No fault": "Aucun défaut",
    "Disabled": "Désactivé",
    "Replacement not recorded": "Remplacement non enregistré",
    "Replacement due": "Remplacement à effectuer",
    "Date unknown": "Date inconnue",
    "In service": "En service",
    "Not fitted": "Non installé",
    "Commanded on": "Allumage commandé",
    "Enabled": "Activé",
    "Controller outputs permitted": "Sorties du contrôleur autorisées",
    "Outputs locked": "Sorties verrouillées",
    "Configuration fault": "Défaut de configuration",
    "Clock fault": "Défaut d’horloge",
    "Control deadline missed": "Délai de contrôle dépassé",
    "Invalid input": "Entrée invalide",
    "Stale input": "Valeur d’entrée périmée",
    "No water supply": "Absence d’alimentation en eau",
    "Protection input active": "Entrée de protection active",
    "Cycle time exceeded": "Durée du cycle dépassée",
    "On": "Allumé",
    "Off": "Éteint",
    "UV current below limit": "Courant UV sous la limite",
    "UV current above limit": "Courant UV au-dessus de la limite",
    "Unexpected current while UV is off": "Courant inattendu avec UV éteint",
    "UV electrical feedback unavailable": "Mesure électrique UV indisponible",
    "UV configuration required": "Configuration UV requise",
    "UV feedback unavailable": "Retour UV indisponible",
    "{name} must be a mapping.": "{name} doit être une table de correspondance.",
    "Unknown {name} key: {key}": "Clé inconnue dans {name} : {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key} : sélectionnez un ID d’entité, ou null pour masquer.",
    "Card configuration must be an object.": "La configuration de la carte doit être un objet.",
    "Choose a Water Purifier full, status or history card type.": "Choisissez une carte Water Purifier de type full, status ou history.",
    "Title must be at most 100 characters.": "Le titre ne doit pas dépasser 100 caractères.",
    "Layout must be full, small or medium.": "La disposition doit être full, small ou medium.",
    "{name} must be true or false.": "{name} doit être true ou false.",
    "history_hours must be an integer from 1 to 24.": "history_hours doit être un entier de 1 à 24.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url doit être une URL http:// ou https:// sans identifiants.",
    "device_id must be a Home Assistant device registry ID.": "device_id doit être un ID du registre des appareils Home Assistant.",
    "filters must be an array with at most eight entries.": "filters doit être un tableau contenant au plus huit entrées.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "Le filtre {count} nécessite un nom (1–60 caractères) et un ID d’entité.",
    "Filter stage must be pp, udf, cto, ro, or post.": "L’étape du filtre doit être pp, udf, cto, ro ou post.",
    "Choose a supported language, or auto to follow Home Assistant.": "Choisissez une langue prise en charge, ou auto pour suivre Home Assistant.",
    "Not mapped": "Non associé",
    "HA disconnected": "HA déconnecté",
    "Entity not found": "Entité introuvable",
    "Unavailable": "Indisponible",
    "Unknown": "Inconnu",
    "Device discovery is unavailable. Map entities manually.": "La découverte des appareils est indisponible. Associez les entités manuellement.",
    "Unexpected registry response. Map entities manually.": "Réponse inattendue du registre. Associez les entités manuellement.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "L’appareil sélectionné n’a pas d’identifiant WATER MQTT unique. Associez les entités manuellement.",
    "Could not discover entities. Use manual mappings.": "Impossible de découvrir les entités. Utilisez les associations manuelles.",
    "PP sediment filter": "Filtre à sédiments PP",
    "UDF granular carbon filter": "Filtre à charbon granulaire UDF",
    "CTO carbon block filter": "Filtre à bloc de charbon CTO",
    "RO membrane": "Membrane RO",
    "T33 post carbon filter": "Postfiltre à charbon T33",
    "Waste valve": "Vanne de rejet",
    "UV lamp": "Lampe UV",
    "Concentrate": "Concentrat",
    "{name} details": "Détails : {name}",
    "Inlet": "Entrée",
    "Pump": "Pompe",
    "Feed": "Entrée",
    "Product": "Eau purifiée",
    "Water circuit diagram": "Schéma du circuit d’eau",
    "Water circuit": "Circuit d’eau",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Circuit d’eau. L’eau d’entrée traverse les préfiltres configurés, l’entrée et la pompe jusqu’à la membrane. L’eau purifiée traverse le postfiltre configuré ; le concentrat sort par la branche de rejet.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Circuit d’eau. L’eau d’entrée traverse les préfiltres configurés, l’entrée et la pompe jusqu’à la membrane. L’eau purifiée traverse le postfiltre configuré et la lampe UV ; le concentrat sort par la branche de rejet.",
    "Total produced": "Total produit",
    "Temperature": "Température",
    "UV fault": "Défaut UV",
    "UV commanded on": "Allumage UV commandé",
    "UV commanded off": "Extinction UV commandée",
    "UV disabled": "UV désactivé",
    "UV setup required": "Configuration UV requise",
    "UV status unknown": "État UV inconnu",
    "Home Assistant disconnected": "Home Assistant déconnecté",
    "Set up device": "Configurer l’appareil",
    "Select a device or map its state": "Sélectionnez un appareil ou associez son état",
    "State entity not found": "Entité d’état introuvable",
    "Device state unavailable": "État de l’appareil indisponible",
    "Needs attention": "À vérifier",
    "Controller reports a fault": "Le contrôleur signale un défaut",
    "Status unknown": "État inconnu",
    "Fault status unavailable": "État des défauts indisponible",
    "Standby": "En veille",
    "Locked": "Verrouillé",
    "Starting": "Démarrage",
    "Pre-rinse": "Prérinçage",
    "Post-rinse": "Postrinçage",
    "Rinsing": "Rinçage",
    "Not producing": "Aucune production",
    "Open controller for details": "Ouvrez le contrôleur pour les détails",
    "Flow unavailable": "Débit indisponible",
    "Waste total": "Total de rejet",
    "Starts": "Démarrages",
    "Product TDS": "TDS eau purifiée",
    "Feed TDS": "TDS eau d’entrée",
    "Retry discovery": "Relancer la découverte",
    "Waiting": "En attente",
    "Last {count} hours": "{count} dernières heures",
    "Last hour": "Dernière heure",
    "History ↗": "Historique ↗",
    "Product TDS history": "Historique TDS de l’eau purifiée",
    "Cumulative usage, independent of the chart time range": "Utilisation cumulée, indépendante de la période du graphique",
    "Usage history": "Historique d’utilisation",
    "Cumulative": "Cumulé",
    "{name} details, accumulated commanded production time": "Détails : {name}, durée cumulée de production commandée",
    "Filter care": "Entretien des filtres",
    "Loading device entities…": "Chargement des entités de l’appareil…",
    "Live": "En direct",
    "Latest reading": "Dernière mesure",
    "Open details": "Ouvrir les détails",
    "Device data unavailable": "Données de l’appareil indisponibles",
    "Reminder off": "Rappel désactivé",
    "{name} · Replacement due": "{name} · Remplacement à effectuer",
    "Due: {count}": "À remplacer : {count}",
    "Unknown: {count}": "Inconnus : {count}",
    "Review": "Vérifier",
    "Reminders are off": "Rappels désactivés",
    "{name} · Reminder off": "{name} · Rappel désactivé",
    "Off: {count}": "Désactivés : {count}",
    "No installed filters in this list": "Aucun filtre installé dans cette liste",
    "No replacement reminders due": "Aucun rappel de remplacement à échéance",
    "Plans: {count}": "Plans : {count}",
    "Filter {count}": "Filtre {count}",
    "Not configured": "Non configuré",
    "Map product TDS to see water quality.": "Associez le TDS de l’eau purifiée pour voir la qualité de l’eau.",
    "WATER CIRCUIT": "CIRCUIT D’EAU",
    "Tap a component to inspect": "Touchez un composant pour l’inspecter",
    "Close component details": "Fermer les détails du composant",
    "More readings & diagnostics": "Autres mesures et diagnostics",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Lecture seule. L’animation de l’eau suit la phase du contrôleur ; elle ne mesure ni le débit ni les vannes. La commande UV ne vérifie pas la désinfection. Les rappels de filtre indiquent l’état des plans, pas une durée de vie restante estimée. Les étapes du circuit suivent votre configuration ; MQTT ne rapporte ni les types de filtres ni la plomberie. L’historique provient de Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Choisissez votre appareil WATER dans l’éditeur de carte ou associez les entités Home Assistant.",
    "Waiting for Home Assistant": "En attente de Home Assistant",
    "Open device dashboard ↗": "Ouvrir le tableau de bord ↗",
    "Controller details ↗": "Détails du contrôleur ↗",
    "State not mapped": "État non associé",
    "Device fault · {name}": "Défaut appareil · {name}",
    "Controller stopped by a fault. Open state details.": "Contrôleur arrêté par un défaut. Ouvrez les détails de l’état.",
    "Purifying · tap to inspect": "Purification · touchez pour les détails",
    "Flushing · tap to inspect": "Rinçage · touchez pour les détails",
    "Service due": "Entretien à effectuer",
    "Service reminders: {count}": "Rappels d’entretien : {count}",
    "Review plan status": "Vérifier l’état des plans",
    "Filter plans: {count}": "Plans de filtre : {count}",
    "State unavailable": "État indisponible",
    "Updated just now": "Mis à jour à l’instant",
    "Updated {count} min ago": "Mis à jour il y a {count} min",
    "Via Home Assistant": "Via Home Assistant",
    "Waiting for history": "En attente de l’historique",
    "Loading history…": "Chargement de l’historique…",
    "No recorded history": "Aucun historique enregistré",
    "History unavailable": "Historique indisponible",
    "Live readings remain available.": "Les mesures en direct restent disponibles.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Évolution enregistrée du TDS de l’eau purifiée. De {from} à {to}. Les interruptions indiquent des mesures manquantes.",
    "Recorded history · live reading unavailable": "Historique enregistré · mesure en direct indisponible",
    "Gaps indicate unavailable readings": "Les interruptions indiquent des mesures indisponibles",
    "The mapped entity is not present in Home Assistant.": "L’entité associée n’est pas présente dans Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "Associez un rappel de filtre vérifié à cette étape dans l’éditeur de carte.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "Aucune entité d’état individuelle n’est associée. La phase du contrôleur ne prouve pas l’état physique du composant.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Découverte automatique indisponible. Les associations manuelles d’entités fonctionnent toujours.",
    "{name} mapping mode": "Mode d’association : {name}",
    "From filter list": "Depuis la liste des filtres",
    "Automatic": "Automatique",
    "Choose entity": "Choisir une entité",
    "Hide": "Masquer",
    "{name} entity": "Entité : {name}",
    "Water quality & production": "Qualité de l’eau et production",
    "Installed equipment & status": "Équipements installés et état",
    "Filter reminder entities": "Entités de rappel de filtre",
    "Device diagnostics": "Diagnostics de l’appareil",
    "Water Purifier Cards": "Cartes de purificateur d’eau",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Choisissez un appareil WATER MQTT ou associez les entités manuellement. Les trois tailles de carte partagent les mêmes réglages d’entités et la même ressource JavaScript.",
    "Device": "Appareil",
    "Manual entity mapping": "Association manuelle des entités",
    "Saved device · {name}": "Appareil enregistré · {name}",
    "Refresh devices": "Actualiser les appareils",
    "WATER devices found: {count}": "Appareils WATER trouvés : {count}",
    "Title": "Titre",
    "Card layout": "Disposition de la carte",
    "Large · Full water circuit": "Grande · Circuit d’eau complet",
    "Small · Device status": "Petite · État de l’appareil",
    "Medium · Quality & history": "Moyenne · Qualité et historique",
    "Device dashboard URL (optional)": "URL du tableau de bord de l’appareil (facultatif)",
    "Animate water paths (large card)": "Animer les trajets d’eau (grande carte)",
    "Show recorded TDS history (medium / large)": "Afficher l’historique TDS enregistré (moyenne/grande)",
    "TDS history window (hours)": "Période de l’historique TDS (heures)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "La petite carte ne demande jamais d’historique. Les totaux de la carte moyenne sont cumulés et indépendants de la période du graphique TDS. La veille ne confirme pas que le fonctionnement automatique est activé.",
    "Physical filter → maintenance entity": "Filtre physique → entité d’entretien",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "Le micrologiciel prend en charge huit emplacements de rappel. Associez-les aux types de filtres installés. Ces associations explicites au clic remplacent les affectations d’étape ci-dessous ; elles ne modifient pas la plomberie.",
    "Filter names & circuit stages": "Noms des filtres et étapes du circuit",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Nommez les filtres installés et affectez leurs étapes réelles. Si chaque entrée a une étape, seuls ces types apparaissent dans le circuit. Sinon, le circuit de référence à cinq étapes reste affiché. Une liste vide masque uniquement les rappels.",
    "Use a custom list": "Utiliser une liste personnalisée",
    "Name": "Nom",
    "Entity": "Entité",
    "Circuit stage": "Étape du circuit",
    "Not assigned": "Non affecté",
    "Remove filter {count}": "Supprimer le filtre {count}",
    "Add reminder": "Ajouter un rappel",
    "Save reminder list": "Enregistrer la liste des rappels",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Les éléments facultatifs non associés sont omis. Une entité associée devenue inconnue ou indisponible reste visible. Seule la grande carte contient un circuit. Aucune carte n’envoie de commandes à l’appareil.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Choisissez une entité sensor, binary_sensor, switch ou une aide de saisie.",
    "Filter reminder": "Rappel de filtre",
    "Language": "Langue",
    "Follow Home Assistant": "Suivre Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "La langue suit votre profil Home Assistant, sauf si vous en choisissez une autre. Les titres et noms de filtres personnalisés sont conservés tels quels.",
    "Water Purifier · Full": "Purificateur d’eau · Complète",
    "Large card with the water circuit, readings, history and filter care.": "Grande carte avec circuit d’eau, mesures, historique et entretien des filtres.",
    "Water Purifier · Status": "Purificateur d’eau · État",
    "Small home card: operating state, product TDS and flow.": "Petite carte d’accueil : état de fonctionnement, TDS de l’eau purifiée et débit.",
    "Water Purifier · History": "Purificateur d’eau · Historique",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Carte moyenne : qualité de l’eau, évolution TDS enregistrée, utilisation cumulée et rappels de filtre."
  },
  "es": {
    "Water purifier": "Purificador de agua",
    "Control state": "Estado del controlador",
    "Fault": "Fallo",
    "Feed water": "Agua de entrada",
    "Product water": "Agua purificada",
    "Feed temperature": "Temperatura de entrada",
    "Product temperature": "Temperatura del agua purificada",
    "Product flow": "Caudal de agua purificada",
    "Concentrate flow": "Caudal de concentrado",
    "Product total": "Total de agua purificada",
    "Concentrate total": "Total de concentrado",
    "RO recovery": "Recuperación de agua RO",
    "Production time": "Tiempo de producción",
    "Uptime": "Tiempo de actividad",
    "Output capability": "Habilitación de salidas",
    "Pump voltage · uncalibrated": "Tensión de bomba · sin calibrar",
    "Pump current · uncalibrated": "Corriente de bomba · sin calibrar",
    "UVC voltage · uncalibrated": "Tensión UVC · sin calibrar",
    "UVC current · uncalibrated": "Corriente UVC · sin calibrar",
    "Production starts": "Arranques de producción",
    "Fault count": "Número de fallos",
    "Filter {count} reminder": "Recordatorio del filtro {count}",
    "Booster pump": "Bomba de presión",
    "Inlet valve": "Válvula de entrada",
    "Flush valve": "Válvula de enjuague",
    "UV output command": "Orden de salida UV",
    "UV installed and enabled": "UV instalado y habilitado",
    "UV controller status": "Estado del controlador UV",
    "Pressure": "Presión",
    "Leak detector": "Detector de fugas",
    "Sediment prefilter": "Prefiltro de sedimentos",
    "Granular carbon prefilter": "Prefiltro de carbón granular",
    "Carbon block prefilter": "Prefiltro de bloque de carbón",
    "Reverse osmosis membrane": "Membrana de ósmosis inversa",
    "Post carbon filter": "Postfiltro de carbón",
    "Installation required": "Instalación requerida",
    "Idle": "En reposo",
    "Opening inlet": "Abriendo entrada",
    "Preflushing": "Enjuague previo",
    "Purifying": "Purificando",
    "Postflushing": "Enjuague posterior",
    "Maintenance": "Mantenimiento",
    "Flushing": "Enjuagando",
    "Output test": "Prueba de salidas",
    "No fault": "Sin fallos",
    "Disabled": "Deshabilitado",
    "Replacement not recorded": "Sustitución no registrada",
    "Replacement due": "Sustitución pendiente",
    "Date unknown": "Fecha desconocida",
    "In service": "En servicio",
    "Not fitted": "No instalado",
    "Commanded on": "Encendido ordenado",
    "Enabled": "Habilitado",
    "Controller outputs permitted": "Salidas del controlador permitidas",
    "Outputs locked": "Salidas bloqueadas",
    "Configuration fault": "Error de configuración",
    "Clock fault": "Error del reloj",
    "Control deadline missed": "Plazo de control excedido",
    "Invalid input": "Entrada no válida",
    "Stale input": "Dato de entrada desactualizado",
    "No water supply": "Sin suministro de agua",
    "Protection input active": "Entrada de protección activa",
    "Cycle time exceeded": "Tiempo de ciclo excedido",
    "On": "Encendido",
    "Off": "Apagado",
    "UV current below limit": "Corriente UV por debajo del límite",
    "UV current above limit": "Corriente UV por encima del límite",
    "Unexpected current while UV is off": "Corriente inesperada con UV apagado",
    "UV electrical feedback unavailable": "Medición eléctrica UV no disponible",
    "UV configuration required": "Configuración UV requerida",
    "UV feedback unavailable": "Señal de retorno UV no disponible",
    "{name} must be a mapping.": "{name} debe ser un mapa de asignaciones.",
    "Unknown {name} key: {key}": "Clave desconocida en {name}: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: selecciona un ID de entidad o null para ocultarla.",
    "Card configuration must be an object.": "La configuración de la tarjeta debe ser un objeto.",
    "Choose a Water Purifier full, status or history card type.": "Elige una tarjeta Water Purifier de tipo full, status o history.",
    "Title must be at most 100 characters.": "El título debe tener como máximo 100 caracteres.",
    "Layout must be full, small or medium.": "El diseño debe ser full, small o medium.",
    "{name} must be true or false.": "{name} debe ser true o false.",
    "history_hours must be an integer from 1 to 24.": "history_hours debe ser un entero de 1 a 24.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url debe ser una URL http:// o https:// sin credenciales.",
    "device_id must be a Home Assistant device registry ID.": "device_id debe ser un ID del registro de dispositivos de Home Assistant.",
    "filters must be an array with at most eight entries.": "filters debe ser una lista con un máximo de ocho entradas.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "El filtro {count} necesita un nombre (1–60 caracteres) y un ID de entidad.",
    "Filter stage must be pp, udf, cto, ro, or post.": "La etapa del filtro debe ser pp, udf, cto, ro o post.",
    "Choose a supported language, or auto to follow Home Assistant.": "Elige un idioma compatible o auto para seguir Home Assistant.",
    "Not mapped": "Sin asignar",
    "HA disconnected": "HA desconectado",
    "Entity not found": "Entidad no encontrada",
    "Unavailable": "No disponible",
    "Unknown": "Desconocido",
    "Device discovery is unavailable. Map entities manually.": "La detección de dispositivos no está disponible. Asigna las entidades manualmente.",
    "Unexpected registry response. Map entities manually.": "Respuesta inesperada del registro. Asigna las entidades manualmente.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "El dispositivo seleccionado no tiene un identificador WATER MQTT único. Asigna las entidades manualmente.",
    "Could not discover entities. Use manual mappings.": "No se pudieron detectar las entidades. Usa asignaciones manuales.",
    "PP sediment filter": "Filtro de sedimentos PP",
    "UDF granular carbon filter": "Filtro de carbón granular UDF",
    "CTO carbon block filter": "Filtro de bloque de carbón CTO",
    "RO membrane": "Membrana RO",
    "T33 post carbon filter": "Postfiltro de carbón T33",
    "Waste valve": "Válvula de rechazo",
    "UV lamp": "Lámpara UV",
    "Concentrate": "Concentrado",
    "{name} details": "Detalles de {name}",
    "Inlet": "Entrada",
    "Pump": "Bomba",
    "Feed": "Entrada",
    "Product": "Agua purificada",
    "Water circuit diagram": "Diagrama del circuito de agua",
    "Water circuit": "Circuito de agua",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Circuito de agua. El agua de entrada pasa por los prefiltros configurados, la entrada y la bomba hasta la membrana. El agua purificada pasa por el postfiltro configurado; el concentrado sale por la rama de rechazo.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Circuito de agua. El agua de entrada pasa por los prefiltros configurados, la entrada y la bomba hasta la membrana. El agua purificada pasa por el postfiltro configurado y la lámpara UV; el concentrado sale por la rama de rechazo.",
    "Total produced": "Total producido",
    "Temperature": "Temperatura",
    "UV fault": "Fallo UV",
    "UV commanded on": "Encendido UV ordenado",
    "UV commanded off": "Apagado UV ordenado",
    "UV disabled": "UV deshabilitado",
    "UV setup required": "Ajuste de UV requerido",
    "UV status unknown": "Estado UV desconocido",
    "Home Assistant disconnected": "Home Assistant desconectado",
    "Set up device": "Configurar dispositivo",
    "Select a device or map its state": "Selecciona un dispositivo o asigna su estado",
    "State entity not found": "Entidad de estado no encontrada",
    "Device state unavailable": "Estado del dispositivo no disponible",
    "Needs attention": "Requiere atención",
    "Controller reports a fault": "El controlador indica un fallo",
    "Status unknown": "Estado desconocido",
    "Fault status unavailable": "Estado de fallos no disponible",
    "Standby": "En espera",
    "Locked": "Bloqueado",
    "Starting": "Iniciando",
    "Pre-rinse": "Enjuague previo",
    "Post-rinse": "Enjuague posterior",
    "Rinsing": "Enjuagando",
    "Not producing": "Sin producir agua",
    "Open controller for details": "Abre el controlador para ver los detalles",
    "Flow unavailable": "Caudal no disponible",
    "Waste total": "Total de rechazo",
    "Starts": "Arranques",
    "Product TDS": "TDS agua purificada",
    "Feed TDS": "TDS agua de entrada",
    "Retry discovery": "Reintentar detección",
    "Waiting": "Esperando",
    "Last {count} hours": "Últimas {count} horas",
    "Last hour": "Última hora",
    "History ↗": "Historial ↗",
    "Product TDS history": "Historial TDS del agua purificada",
    "Cumulative usage, independent of the chart time range": "Uso acumulado, independiente del intervalo del gráfico",
    "Usage history": "Historial de uso",
    "Cumulative": "Acumulado",
    "{name} details, accumulated commanded production time": "Detalles de {name}, tiempo acumulado de producción ordenada",
    "Filter care": "Mantenimiento de filtros",
    "Loading device entities…": "Cargando entidades del dispositivo…",
    "Live": "En directo",
    "Latest reading": "Última lectura",
    "Open details": "Abrir detalles",
    "Device data unavailable": "Datos del dispositivo no disponibles",
    "Reminder off": "Recordatorio desactivado",
    "{name} · Replacement due": "{name} · Sustitución pendiente",
    "Due: {count}": "Pendientes: {count}",
    "Unknown: {count}": "Desconocidos: {count}",
    "Review": "Revisar",
    "Reminders are off": "Recordatorios desactivados",
    "{name} · Reminder off": "{name} · Recordatorio desactivado",
    "Off: {count}": "Desactivados: {count}",
    "No installed filters in this list": "No hay filtros instalados en esta lista",
    "No replacement reminders due": "No hay sustituciones pendientes",
    "Plans: {count}": "Planes: {count}",
    "Filter {count}": "Filtro {count}",
    "Not configured": "Sin configurar",
    "Map product TDS to see water quality.": "Asigna el TDS del agua purificada para ver la calidad del agua.",
    "WATER CIRCUIT": "CIRCUITO DE AGUA",
    "Tap a component to inspect": "Toca un componente para verlo",
    "Close component details": "Cerrar detalles del componente",
    "More readings & diagnostics": "Más lecturas y diagnóstico",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Solo lectura. La animación del agua sigue la fase del controlador; no mide el caudal ni el estado de las válvulas. La orden UV no verifica la desinfección. Los recordatorios de filtros muestran el estado de los planes, no una vida útil restante estimada. Las etapas siguen la configuración de la tarjeta; MQTT no informa de tipos de filtro ni de tuberías. El historial procede de Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Elige tu dispositivo WATER en el editor de tarjetas o asigna entidades de Home Assistant.",
    "Waiting for Home Assistant": "Esperando a Home Assistant",
    "Open device dashboard ↗": "Abrir panel del dispositivo ↗",
    "Controller details ↗": "Detalles del controlador ↗",
    "State not mapped": "Estado sin asignar",
    "Device fault · {name}": "Fallo del dispositivo · {name}",
    "Controller stopped by a fault. Open state details.": "Controlador detenido por un fallo. Abre los detalles del estado.",
    "Purifying · tap to inspect": "Purificando · toca para ver",
    "Flushing · tap to inspect": "Enjuagando · toca para ver",
    "Service due": "Mantenimiento pendiente",
    "Service reminders: {count}": "Recordatorios de mantenimiento: {count}",
    "Review plan status": "Revisar estado de los planes",
    "Filter plans: {count}": "Planes de filtros: {count}",
    "State unavailable": "Estado no disponible",
    "Updated just now": "Actualizado ahora",
    "Updated {count} min ago": "Actualizado hace {count} min",
    "Via Home Assistant": "A través de Home Assistant",
    "Waiting for history": "Esperando historial",
    "Loading history…": "Cargando historial…",
    "No recorded history": "Sin historial registrado",
    "History unavailable": "Historial no disponible",
    "Live readings remain available.": "Las lecturas en directo siguen disponibles.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Tendencia registrada del TDS del agua purificada. De {from} a {to}. Los huecos indican lecturas ausentes.",
    "Recorded history · live reading unavailable": "Historial registrado · lectura en directo no disponible",
    "Gaps indicate unavailable readings": "Los huecos indican lecturas no disponibles",
    "The mapped entity is not present in Home Assistant.": "La entidad asignada no está presente en Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "Asigna un recordatorio de filtro verificado a esta etapa en el editor de tarjetas.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "No hay una entidad de estado individual asignada. La fase del controlador no demuestra el estado físico del componente.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Detección automática no disponible. Las asignaciones manuales de entidades siguen funcionando.",
    "{name} mapping mode": "Modo de asignación de {name}",
    "From filter list": "De la lista de filtros",
    "Automatic": "Automático",
    "Choose entity": "Elegir entidad",
    "Hide": "Ocultar",
    "{name} entity": "Entidad de {name}",
    "Water quality & production": "Calidad del agua y producción",
    "Installed equipment & status": "Equipos instalados y estado",
    "Filter reminder entities": "Entidades de recordatorio de filtros",
    "Device diagnostics": "Diagnóstico del dispositivo",
    "Water Purifier Cards": "Tarjetas de purificador de agua",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Elige un dispositivo WATER MQTT o asigna las entidades manualmente. Los tres tamaños de tarjeta comparten los mismos ajustes de entidades y el mismo recurso JavaScript.",
    "Device": "Dispositivo",
    "Manual entity mapping": "Asignación manual de entidades",
    "Saved device · {name}": "Dispositivo guardado · {name}",
    "Refresh devices": "Actualizar dispositivos",
    "WATER devices found: {count}": "Dispositivos WATER encontrados: {count}",
    "Title": "Título",
    "Card layout": "Diseño de tarjeta",
    "Large · Full water circuit": "Grande · Circuito de agua completo",
    "Small · Device status": "Pequeña · Estado del dispositivo",
    "Medium · Quality & history": "Mediana · Calidad e historial",
    "Device dashboard URL (optional)": "URL del panel del dispositivo (opcional)",
    "Animate water paths (large card)": "Animar los recorridos del agua (tarjeta grande)",
    "Show recorded TDS history (medium / large)": "Mostrar historial TDS registrado (mediana/grande)",
    "TDS history window (hours)": "Intervalo del historial TDS (horas)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "La tarjeta pequeña nunca solicita historial. Los totales de uso de la tarjeta mediana son acumulados e independientes del intervalo del gráfico TDS. El estado de espera no confirma que el funcionamiento automático esté habilitado.",
    "Physical filter → maintenance entity": "Filtro físico → entidad de mantenimiento",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "El firmware admite ocho espacios de recordatorio. Asígnalos a los tipos de filtro instalados. Estas asignaciones explícitas al pulsar tienen prioridad sobre las etapas siguientes; no cambian las tuberías.",
    "Filter names & circuit stages": "Nombres de filtros y etapas del circuito",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Nombra los filtros instalados y asigna sus etapas reales. Si cada entrada tiene una etapa, solo esos tipos aparecerán en el circuito. En caso contrario, se mantiene el circuito de referencia de cinco etapas. Una lista vacía solo oculta los recordatorios.",
    "Use a custom list": "Usar una lista personalizada",
    "Name": "Nombre",
    "Entity": "Entidad",
    "Circuit stage": "Etapa del circuito",
    "Not assigned": "Sin asignar",
    "Remove filter {count}": "Eliminar filtro {count}",
    "Add reminder": "Añadir recordatorio",
    "Save reminder list": "Guardar lista de recordatorios",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Los elementos opcionales sin asignar se omiten. Una entidad asignada que pase a desconocida o no disponible sigue visible. Solo la tarjeta grande incluye un circuito. Ninguna tarjeta envía órdenes al dispositivo.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Elige una entidad sensor, binary_sensor, switch o un ayudante de entrada.",
    "Filter reminder": "Recordatorio de filtro",
    "Language": "Idioma",
    "Follow Home Assistant": "Seguir Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "El idioma sigue tu perfil de Home Assistant salvo que elijas otro. Los títulos y nombres de filtros personalizados se conservan tal como los introduces.",
    "Water Purifier · Full": "Purificador de agua · Completa",
    "Large card with the water circuit, readings, history and filter care.": "Tarjeta grande con circuito de agua, lecturas, historial y mantenimiento de filtros.",
    "Water Purifier · Status": "Purificador de agua · Estado",
    "Small home card: operating state, product TDS and flow.": "Tarjeta pequeña de inicio: estado de funcionamiento, TDS del agua purificada y caudal.",
    "Water Purifier · History": "Purificador de agua · Historial",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Tarjeta mediana: calidad del agua, tendencia TDS registrada, uso acumulado y recordatorios de filtros."
  },
  "it": {
    "Water purifier": "Depuratore d’acqua",
    "Control state": "Stato del controller",
    "Fault": "Guasto",
    "Feed water": "Acqua in ingresso",
    "Product water": "Acqua depurata",
    "Feed temperature": "Temperatura in ingresso",
    "Product temperature": "Temperatura acqua depurata",
    "Product flow": "Portata acqua depurata",
    "Concentrate flow": "Portata concentrato",
    "Product total": "Totale acqua depurata",
    "Concentrate total": "Totale concentrato",
    "RO recovery": "Recupero acqua RO",
    "Production time": "Tempo di produzione",
    "Uptime": "Tempo di attività",
    "Output capability": "Abilitazione uscite",
    "Pump voltage · uncalibrated": "Tensione pompa · non calibrata",
    "Pump current · uncalibrated": "Corrente pompa · non calibrata",
    "UVC voltage · uncalibrated": "Tensione UVC · non calibrata",
    "UVC current · uncalibrated": "Corrente UVC · non calibrata",
    "Production starts": "Avvii produzione",
    "Fault count": "Numero di guasti",
    "Filter {count} reminder": "Promemoria filtro {count}",
    "Booster pump": "Pompa di pressurizzazione",
    "Inlet valve": "Valvola d’ingresso",
    "Flush valve": "Valvola di risciacquo",
    "UV output command": "Comando uscita UV",
    "UV installed and enabled": "UV installato e abilitato",
    "UV controller status": "Stato controller UV",
    "Pressure": "Pressione",
    "Leak detector": "Sensore perdite",
    "Sediment prefilter": "Prefiltro sedimenti",
    "Granular carbon prefilter": "Prefiltro a carbone granulare",
    "Carbon block prefilter": "Prefiltro a carbone in blocco",
    "Reverse osmosis membrane": "Membrana a osmosi inversa",
    "Post carbon filter": "Postfiltro a carbone",
    "Installation required": "Installazione richiesta",
    "Idle": "A riposo",
    "Opening inlet": "Apertura ingresso",
    "Preflushing": "Prerisciacquo",
    "Purifying": "Depurazione",
    "Postflushing": "Risciacquo finale",
    "Maintenance": "Manutenzione",
    "Flushing": "Risciacquo",
    "Output test": "Test uscite",
    "No fault": "Nessun guasto",
    "Disabled": "Disabilitato",
    "Replacement not recorded": "Sostituzione non registrata",
    "Replacement due": "Sostituzione necessaria",
    "Date unknown": "Data sconosciuta",
    "In service": "In servizio",
    "Not fitted": "Non installato",
    "Commanded on": "Accensione comandata",
    "Enabled": "Abilitato",
    "Controller outputs permitted": "Uscite controller consentite",
    "Outputs locked": "Uscite bloccate",
    "Configuration fault": "Errore di configurazione",
    "Clock fault": "Errore orologio",
    "Control deadline missed": "Scadenza di controllo superata",
    "Invalid input": "Ingresso non valido",
    "Stale input": "Dato ingresso obsoleto",
    "No water supply": "Alimentazione acqua assente",
    "Protection input active": "Ingresso protezione attivo",
    "Cycle time exceeded": "Durata ciclo superata",
    "On": "Acceso",
    "Off": "Spento",
    "UV current below limit": "Corrente UV sotto il limite",
    "UV current above limit": "Corrente UV sopra il limite",
    "Unexpected current while UV is off": "Corrente inattesa con UV spento",
    "UV electrical feedback unavailable": "Misura elettrica UV non disponibile",
    "UV configuration required": "Configurazione UV richiesta",
    "UV feedback unavailable": "Riscontro UV non disponibile",
    "{name} must be a mapping.": "{name} deve essere una mappa di associazioni.",
    "Unknown {name} key: {key}": "Chiave sconosciuta in {name}: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: scegli un ID entità oppure null per nasconderla.",
    "Card configuration must be an object.": "La configurazione della scheda deve essere un oggetto.",
    "Choose a Water Purifier full, status or history card type.": "Scegli una scheda Water Purifier di tipo full, status o history.",
    "Title must be at most 100 characters.": "Il titolo può contenere al massimo 100 caratteri.",
    "Layout must be full, small or medium.": "Il layout deve essere full, small o medium.",
    "{name} must be true or false.": "{name} deve essere true o false.",
    "history_hours must be an integer from 1 to 24.": "history_hours deve essere un intero da 1 a 24.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url deve essere un URL http:// o https:// senza credenziali.",
    "device_id must be a Home Assistant device registry ID.": "device_id deve essere un ID del registro dispositivi di Home Assistant.",
    "filters must be an array with at most eight entries.": "filters deve essere un array con al massimo otto voci.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "Il filtro {count} richiede un nome (1–60 caratteri) e un ID entità.",
    "Filter stage must be pp, udf, cto, ro, or post.": "Lo stadio del filtro deve essere pp, udf, cto, ro o post.",
    "Choose a supported language, or auto to follow Home Assistant.": "Scegli una lingua supportata oppure auto per seguire Home Assistant.",
    "Not mapped": "Non associato",
    "HA disconnected": "HA disconnesso",
    "Entity not found": "Entità non trovata",
    "Unavailable": "Non disponibile",
    "Unknown": "Sconosciuto",
    "Device discovery is unavailable. Map entities manually.": "Rilevamento dispositivi non disponibile. Associa le entità manualmente.",
    "Unexpected registry response. Map entities manually.": "Risposta inattesa dal registro. Associa le entità manualmente.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "Il dispositivo selezionato non ha un identificatore WATER MQTT univoco. Associa le entità manualmente.",
    "Could not discover entities. Use manual mappings.": "Impossibile rilevare le entità. Usa le associazioni manuali.",
    "PP sediment filter": "Filtro sedimenti PP",
    "UDF granular carbon filter": "Filtro a carbone granulare UDF",
    "CTO carbon block filter": "Filtro a carbone in blocco CTO",
    "RO membrane": "Membrana RO",
    "T33 post carbon filter": "Postfiltro a carbone T33",
    "Waste valve": "Valvola di scarico",
    "UV lamp": "Lampada UV",
    "Concentrate": "Concentrato",
    "{name} details": "Dettagli di {name}",
    "Inlet": "Ingresso",
    "Pump": "Pompa",
    "Feed": "Ingresso",
    "Product": "Acqua depurata",
    "Water circuit diagram": "Schema circuito acqua",
    "Water circuit": "Circuito acqua",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Circuito acqua. L’acqua in ingresso attraversa i prefiltri configurati, l’ingresso e la pompa fino al ramo della membrana. L’acqua depurata attraversa il postfiltro configurato; il concentrato esce dal ramo di scarico.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Circuito acqua. L’acqua in ingresso attraversa i prefiltri configurati, l’ingresso e la pompa fino al ramo della membrana. L’acqua depurata attraversa il postfiltro configurato e la lampada UV; il concentrato esce dal ramo di scarico.",
    "Total produced": "Totale prodotto",
    "Temperature": "Temperatura",
    "UV fault": "Guasto UV",
    "UV commanded on": "Accensione UV comandata",
    "UV commanded off": "Spegnimento UV comandato",
    "UV disabled": "UV disabilitato",
    "UV setup required": "Configurazione UV richiesta",
    "UV status unknown": "Stato UV sconosciuto",
    "Home Assistant disconnected": "Home Assistant disconnesso",
    "Set up device": "Configura dispositivo",
    "Select a device or map its state": "Seleziona un dispositivo o associa il suo stato",
    "State entity not found": "Entità di stato non trovata",
    "Device state unavailable": "Stato dispositivo non disponibile",
    "Needs attention": "Richiede attenzione",
    "Controller reports a fault": "Il controller segnala un guasto",
    "Status unknown": "Stato sconosciuto",
    "Fault status unavailable": "Stato guasti non disponibile",
    "Standby": "In attesa",
    "Locked": "Bloccato",
    "Starting": "Avvio",
    "Pre-rinse": "Prerisciacquo",
    "Post-rinse": "Risciacquo finale",
    "Rinsing": "Risciacquo",
    "Not producing": "Produzione inattiva",
    "Open controller for details": "Apri il controller per i dettagli",
    "Flow unavailable": "Portata non disponibile",
    "Waste total": "Totale scaricato",
    "Starts": "Avvii",
    "Product TDS": "TDS acqua depurata",
    "Feed TDS": "TDS acqua in ingresso",
    "Retry discovery": "Riprova rilevamento",
    "Waiting": "In attesa",
    "Last {count} hours": "Ultime {count} ore",
    "Last hour": "Ultima ora",
    "History ↗": "Cronologia ↗",
    "Product TDS history": "Cronologia TDS acqua depurata",
    "Cumulative usage, independent of the chart time range": "Uso cumulativo, indipendente dall’intervallo del grafico",
    "Usage history": "Cronologia utilizzo",
    "Cumulative": "Cumulativo",
    "{name} details, accumulated commanded production time": "Dettagli di {name}, tempo accumulato di produzione comandata",
    "Filter care": "Manutenzione filtri",
    "Loading device entities…": "Caricamento entità dispositivo…",
    "Live": "In tempo reale",
    "Latest reading": "Ultima lettura",
    "Open details": "Apri dettagli",
    "Device data unavailable": "Dati dispositivo non disponibili",
    "Reminder off": "Promemoria disattivato",
    "{name} · Replacement due": "{name} · Sostituzione necessaria",
    "Due: {count}": "Da sostituire: {count}",
    "Unknown: {count}": "Sconosciuti: {count}",
    "Review": "Controlla",
    "Reminders are off": "Promemoria disattivati",
    "{name} · Reminder off": "{name} · Promemoria disattivato",
    "Off: {count}": "Disattivati: {count}",
    "No installed filters in this list": "Nessun filtro installato in questo elenco",
    "No replacement reminders due": "Nessun promemoria di sostituzione scaduto",
    "Plans: {count}": "Piani: {count}",
    "Filter {count}": "Filtro {count}",
    "Not configured": "Non configurato",
    "Map product TDS to see water quality.": "Associa il TDS dell’acqua depurata per vedere la qualità dell’acqua.",
    "WATER CIRCUIT": "CIRCUITO ACQUA",
    "Tap a component to inspect": "Tocca un componente per i dettagli",
    "Close component details": "Chiudi dettagli componente",
    "More readings & diagnostics": "Altre letture e diagnostica",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Sola lettura. L’animazione dell’acqua segue la fase del controller, non misura portata o stato delle valvole. Il comando UV non verifica la disinfezione. I promemoria filtri indicano gli stati dei piani, non una stima della vita residua. Gli stadi del circuito seguono la configurazione della scheda; MQTT non riporta tipi di filtro o collegamenti idraulici. La cronologia proviene da Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Scegli il dispositivo WATER nell’editor della scheda oppure associa le entità di Home Assistant.",
    "Waiting for Home Assistant": "In attesa di Home Assistant",
    "Open device dashboard ↗": "Apri pannello dispositivo ↗",
    "Controller details ↗": "Dettagli controller ↗",
    "State not mapped": "Stato non associato",
    "Device fault · {name}": "Guasto dispositivo · {name}",
    "Controller stopped by a fault. Open state details.": "Controller arrestato per un guasto. Apri i dettagli dello stato.",
    "Purifying · tap to inspect": "Depurazione · tocca per i dettagli",
    "Flushing · tap to inspect": "Risciacquo · tocca per i dettagli",
    "Service due": "Manutenzione necessaria",
    "Service reminders: {count}": "Promemoria manutenzione: {count}",
    "Review plan status": "Controlla stato piani",
    "Filter plans: {count}": "Piani filtri: {count}",
    "State unavailable": "Stato non disponibile",
    "Updated just now": "Aggiornato ora",
    "Updated {count} min ago": "Aggiornato {count} min fa",
    "Via Home Assistant": "Tramite Home Assistant",
    "Waiting for history": "In attesa della cronologia",
    "Loading history…": "Caricamento cronologia…",
    "No recorded history": "Nessuna cronologia registrata",
    "History unavailable": "Cronologia non disponibile",
    "Live readings remain available.": "Le letture in tempo reale restano disponibili.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Andamento registrato del TDS dell’acqua depurata. Da {from} a {to}. Gli intervalli vuoti indicano letture mancanti.",
    "Recorded history · live reading unavailable": "Cronologia registrata · lettura in tempo reale non disponibile",
    "Gaps indicate unavailable readings": "Gli intervalli vuoti indicano letture non disponibili",
    "The mapped entity is not present in Home Assistant.": "L’entità associata non è presente in Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "Associa un promemoria filtro verificato a questo stadio nell’editor della scheda.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "Nessuna entità di stato individuale associata. La fase del controller non dimostra lo stato fisico del componente.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Rilevamento automatico non disponibile. Le associazioni manuali delle entità continuano a funzionare.",
    "{name} mapping mode": "Modalità associazione di {name}",
    "From filter list": "Dall’elenco filtri",
    "Automatic": "Automatico",
    "Choose entity": "Scegli entità",
    "Hide": "Nascondi",
    "{name} entity": "Entità di {name}",
    "Water quality & production": "Qualità acqua e produzione",
    "Installed equipment & status": "Dispositivi installati e stato",
    "Filter reminder entities": "Entità promemoria filtri",
    "Device diagnostics": "Diagnostica dispositivo",
    "Water Purifier Cards": "Schede depuratore d’acqua",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Scegli un dispositivo WATER MQTT oppure associa le entità manualmente. Le tre dimensioni di scheda condividono le stesse impostazioni delle entità e la stessa risorsa JavaScript.",
    "Device": "Dispositivo",
    "Manual entity mapping": "Associazione manuale entità",
    "Saved device · {name}": "Dispositivo salvato · {name}",
    "Refresh devices": "Aggiorna dispositivi",
    "WATER devices found: {count}": "Dispositivi WATER trovati: {count}",
    "Title": "Titolo",
    "Card layout": "Layout scheda",
    "Large · Full water circuit": "Grande · Circuito acqua completo",
    "Small · Device status": "Piccola · Stato dispositivo",
    "Medium · Quality & history": "Media · Qualità e cronologia",
    "Device dashboard URL (optional)": "URL pannello dispositivo (facoltativo)",
    "Animate water paths (large card)": "Anima i percorsi dell’acqua (scheda grande)",
    "Show recorded TDS history (medium / large)": "Mostra cronologia TDS registrata (media/grande)",
    "TDS history window (hours)": "Intervallo cronologia TDS (ore)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "La scheda piccola non richiede mai la cronologia. I totali di utilizzo della scheda media sono cumulativi e indipendenti dall’intervallo del grafico TDS. Lo stato di attesa non conferma che il funzionamento automatico sia abilitato.",
    "Physical filter → maintenance entity": "Filtro fisico → entità manutenzione",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "Il firmware supporta otto posizioni per i promemoria. Abbinale ai tipi di filtro installati. Queste associazioni esplicite al clic prevalgono sugli stadi indicati sotto; non modificano i collegamenti idraulici.",
    "Filter names & circuit stages": "Nomi filtri e stadi del circuito",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Assegna un nome ai filtri installati e indica i loro stadi reali. Se ogni voce ha uno stadio, nel circuito compaiono solo quei tipi. Altrimenti resta il circuito di riferimento a cinque stadi. Un elenco vuoto nasconde solo i promemoria.",
    "Use a custom list": "Usa un elenco personalizzato",
    "Name": "Nome",
    "Entity": "Entità",
    "Circuit stage": "Stadio del circuito",
    "Not assigned": "Non assegnato",
    "Remove filter {count}": "Rimuovi filtro {count}",
    "Add reminder": "Aggiungi promemoria",
    "Save reminder list": "Salva elenco promemoria",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Gli elementi facoltativi non associati vengono omessi. Un’entità associata che diventa sconosciuta o non disponibile resta visibile. Solo la scheda grande include un circuito. Nessuna scheda invia comandi al dispositivo.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Scegli un’entità sensor, binary_sensor, switch oppure un helper di ingresso.",
    "Filter reminder": "Promemoria filtro",
    "Language": "Lingua",
    "Follow Home Assistant": "Segui Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "La lingua segue il tuo profilo Home Assistant, salvo una scelta diversa. I titoli e i nomi dei filtri personalizzati restano come inseriti.",
    "Water Purifier · Full": "Depuratore d’acqua · Completa",
    "Large card with the water circuit, readings, history and filter care.": "Scheda grande con circuito acqua, letture, cronologia e manutenzione filtri.",
    "Water Purifier · Status": "Depuratore d’acqua · Stato",
    "Small home card: operating state, product TDS and flow.": "Scheda piccola per la home: stato operativo, TDS acqua depurata e portata.",
    "Water Purifier · History": "Depuratore d’acqua · Cronologia",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Scheda media: qualità acqua, andamento TDS registrato, uso cumulativo e promemoria filtri."
  },
  "nl": {
    "Water purifier": "Waterzuiveraar",
    "Control state": "Regelstatus",
    "Fault": "Storing",
    "Feed water": "Voedingswater",
    "Product water": "Gezuiverd water",
    "Feed temperature": "Temperatuur voedingswater",
    "Product temperature": "Temperatuur gezuiverd water",
    "Product flow": "Debiet gezuiverd water",
    "Concentrate flow": "Concentraatdebiet",
    "Product total": "Totaal gezuiverd water",
    "Concentrate total": "Totaal concentraat",
    "RO recovery": "RO-wateropbrengst",
    "Production time": "Productietijd",
    "Uptime": "Bedrijfstijd",
    "Output capability": "Uitgangsvrijgave",
    "Pump voltage · uncalibrated": "Pompspanning · ongekalibreerd",
    "Pump current · uncalibrated": "Pompstroom · ongekalibreerd",
    "UVC voltage · uncalibrated": "UVC-spanning · ongekalibreerd",
    "UVC current · uncalibrated": "UVC-stroom · ongekalibreerd",
    "Production starts": "Productiestarts",
    "Fault count": "Aantal storingen",
    "Filter {count} reminder": "Herinnering filter {count}",
    "Booster pump": "Drukverhogingspomp",
    "Inlet valve": "Inlaatklep",
    "Flush valve": "Spoelklep",
    "UV output command": "UV-uitgangscommando",
    "UV installed and enabled": "UV geïnstalleerd en ingeschakeld",
    "UV controller status": "Status UV-controller",
    "Pressure": "Druk",
    "Leak detector": "Leksensor",
    "Sediment prefilter": "Sedimentvoorfilter",
    "Granular carbon prefilter": "Koolgranulaatvoorfilter",
    "Carbon block prefilter": "Koolblokvoorfilter",
    "Reverse osmosis membrane": "Omgekeerde-osmosemembraan",
    "Post carbon filter": "Koolnafilter",
    "Installation required": "Installatie vereist",
    "Idle": "In rust",
    "Opening inlet": "Inlaat openen",
    "Preflushing": "Voorspoelen",
    "Purifying": "Zuiveren",
    "Postflushing": "Naspoelen",
    "Maintenance": "Onderhoud",
    "Flushing": "Spoelen",
    "Output test": "Uitgangstest",
    "No fault": "Geen storing",
    "Disabled": "Uitgeschakeld",
    "Replacement not recorded": "Vervanging niet geregistreerd",
    "Replacement due": "Vervanging nodig",
    "Date unknown": "Datum onbekend",
    "In service": "In gebruik",
    "Not fitted": "Niet geïnstalleerd",
    "Commanded on": "Inschakeling aangestuurd",
    "Enabled": "Ingeschakeld",
    "Controller outputs permitted": "Controlleruitgangen vrijgegeven",
    "Outputs locked": "Uitgangen geblokkeerd",
    "Configuration fault": "Configuratiefout",
    "Clock fault": "Klokfout",
    "Control deadline missed": "Regeldeadline overschreden",
    "Invalid input": "Ongeldige ingang",
    "Stale input": "Verouderde ingangswaarde",
    "No water supply": "Geen watertoevoer",
    "Protection input active": "Beveiligingsingang actief",
    "Cycle time exceeded": "Cyclustijd overschreden",
    "On": "Aan",
    "Off": "Uit",
    "UV current below limit": "UV-stroom onder de grens",
    "UV current above limit": "UV-stroom boven de grens",
    "Unexpected current while UV is off": "Onverwachte stroom terwijl UV uit is",
    "UV electrical feedback unavailable": "Elektrische UV-terugmelding niet beschikbaar",
    "UV configuration required": "UV-configuratie vereist",
    "UV feedback unavailable": "UV-terugmelding niet beschikbaar",
    "{name} must be a mapping.": "{name} moet een koppelingstabel zijn.",
    "Unknown {name} key: {key}": "Onbekende sleutel in {name}: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: kies een entiteits-ID of null om deze te verbergen.",
    "Card configuration must be an object.": "De kaartconfiguratie moet een object zijn.",
    "Choose a Water Purifier full, status or history card type.": "Kies een Water Purifier-kaart van het type full, status of history.",
    "Title must be at most 100 characters.": "De titel mag maximaal 100 tekens bevatten.",
    "Layout must be full, small or medium.": "De indeling moet full, small of medium zijn.",
    "{name} must be true or false.": "{name} moet true of false zijn.",
    "history_hours must be an integer from 1 to 24.": "history_hours moet een geheel getal van 1 tot 24 zijn.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url moet een http://- of https://-URL zonder aanmeldgegevens zijn.",
    "device_id must be a Home Assistant device registry ID.": "device_id moet een apparaatregister-ID van Home Assistant zijn.",
    "filters must be an array with at most eight entries.": "filters moet een array met maximaal acht items zijn.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "Filter {count} heeft een naam (1–60 tekens) en een entiteits-ID nodig.",
    "Filter stage must be pp, udf, cto, ro, or post.": "De filtertrap moet pp, udf, cto, ro of post zijn.",
    "Choose a supported language, or auto to follow Home Assistant.": "Kies een ondersteunde taal of auto om Home Assistant te volgen.",
    "Not mapped": "Niet gekoppeld",
    "HA disconnected": "HA niet verbonden",
    "Entity not found": "Entiteit niet gevonden",
    "Unavailable": "Niet beschikbaar",
    "Unknown": "Onbekend",
    "Device discovery is unavailable. Map entities manually.": "Apparaatdetectie is niet beschikbaar. Koppel entiteiten handmatig.",
    "Unexpected registry response. Map entities manually.": "Onverwacht antwoord van het register. Koppel entiteiten handmatig.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "Het geselecteerde apparaat heeft geen unieke WATER MQTT-identificatie. Koppel entiteiten handmatig.",
    "Could not discover entities. Use manual mappings.": "Entiteiten konden niet worden gedetecteerd. Gebruik handmatige koppelingen.",
    "PP sediment filter": "PP-sedimentfilter",
    "UDF granular carbon filter": "UDF-koolgranulaatfilter",
    "CTO carbon block filter": "CTO-koolblokfilter",
    "RO membrane": "RO-membraan",
    "T33 post carbon filter": "T33-koolnafilter",
    "Waste valve": "Concentraatklep",
    "UV lamp": "UV-lamp",
    "Concentrate": "Concentraat",
    "{name} details": "Details van {name}",
    "Inlet": "Inlaat",
    "Pump": "Pomp",
    "Feed": "Toevoer",
    "Product": "Gezuiverd",
    "Water circuit diagram": "Watercircuitschema",
    "Water circuit": "Watercircuit",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Watercircuit. Het voedingswater stroomt via de ingestelde voorfilters, inlaat en pomp naar de membraantak. Het gezuiverde water stroomt door het ingestelde nafilter; het concentraat verlaat het circuit via de afvoertak.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Watercircuit. Het voedingswater stroomt via de ingestelde voorfilters, inlaat en pomp naar de membraantak. Het gezuiverde water stroomt door het ingestelde nafilter en de UV-lamp; het concentraat verlaat het circuit via de afvoertak.",
    "Total produced": "Totaal geproduceerd",
    "Temperature": "Temperatuur",
    "UV fault": "UV-storing",
    "UV commanded on": "UV-inschakeling aangestuurd",
    "UV commanded off": "UV-uitschakeling aangestuurd",
    "UV disabled": "UV uitgeschakeld",
    "UV setup required": "UV-instelling vereist",
    "UV status unknown": "UV-status onbekend",
    "Home Assistant disconnected": "Home Assistant niet verbonden",
    "Set up device": "Apparaat instellen",
    "Select a device or map its state": "Selecteer een apparaat of koppel de status",
    "State entity not found": "Statusentiteit niet gevonden",
    "Device state unavailable": "Apparaatstatus niet beschikbaar",
    "Needs attention": "Aandacht nodig",
    "Controller reports a fault": "De controller meldt een storing",
    "Status unknown": "Status onbekend",
    "Fault status unavailable": "Storingsstatus niet beschikbaar",
    "Standby": "Stand-by",
    "Locked": "Geblokkeerd",
    "Starting": "Starten",
    "Pre-rinse": "Voorspoelen",
    "Post-rinse": "Naspoelen",
    "Rinsing": "Spoelen",
    "Not producing": "Geen productie",
    "Open controller for details": "Open de controller voor details",
    "Flow unavailable": "Debiet niet beschikbaar",
    "Waste total": "Totaal afvoerwater",
    "Starts": "Starts",
    "Product TDS": "TDS gezuiverd water",
    "Feed TDS": "TDS voedingswater",
    "Retry discovery": "Detectie opnieuw proberen",
    "Waiting": "Wachten",
    "Last {count} hours": "Afgelopen {count} uur",
    "Last hour": "Afgelopen uur",
    "History ↗": "Geschiedenis ↗",
    "Product TDS history": "TDS-geschiedenis gezuiverd water",
    "Cumulative usage, independent of the chart time range": "Cumulatief gebruik, onafhankelijk van de grafiekperiode",
    "Usage history": "Gebruiksgeschiedenis",
    "Cumulative": "Cumulatief",
    "{name} details, accumulated commanded production time": "Details van {name}, opgetelde aangestuurde productietijd",
    "Filter care": "Filteronderhoud",
    "Loading device entities…": "Apparaatentiteiten laden…",
    "Live": "Live",
    "Latest reading": "Laatste meting",
    "Open details": "Details openen",
    "Device data unavailable": "Apparaatgegevens niet beschikbaar",
    "Reminder off": "Herinnering uit",
    "{name} · Replacement due": "{name} · Vervanging nodig",
    "Due: {count}": "Te vervangen: {count}",
    "Unknown: {count}": "Onbekend: {count}",
    "Review": "Controleren",
    "Reminders are off": "Herinneringen staan uit",
    "{name} · Reminder off": "{name} · Herinnering uit",
    "Off: {count}": "Uit: {count}",
    "No installed filters in this list": "Geen geïnstalleerde filters in deze lijst",
    "No replacement reminders due": "Geen vervangingstermijnen verstreken",
    "Plans: {count}": "Plannen: {count}",
    "Filter {count}": "Filter {count}",
    "Not configured": "Niet ingesteld",
    "Map product TDS to see water quality.": "Koppel de TDS van gezuiverd water om de waterkwaliteit te zien.",
    "WATER CIRCUIT": "WATERCIRCUIT",
    "Tap a component to inspect": "Tik op een onderdeel voor details",
    "Close component details": "Onderdeeldetails sluiten",
    "More readings & diagnostics": "Meer metingen en diagnostiek",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Alleen-lezen. De wateranimatie volgt de controllerfase en is geen terugmelding van debiet of kleppen. Het UV-commando bevestigt geen desinfectie. Filterherinneringen tonen gemelde planstatussen, geen geschatte resterende levensduur. Circuittrappen volgen je kaartconfiguratie; MQTT meldt geen filtertypen of leidingwerk. De geschiedenis komt uit Home Assistant Recorder.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Kies je WATER-apparaat in de kaarteditor of koppel Home Assistant-entiteiten.",
    "Waiting for Home Assistant": "Wachten op Home Assistant",
    "Open device dashboard ↗": "Apparaatdashboard openen ↗",
    "Controller details ↗": "Controllerdetails ↗",
    "State not mapped": "Status niet gekoppeld",
    "Device fault · {name}": "Apparaatstoring · {name}",
    "Controller stopped by a fault. Open state details.": "Controller gestopt door een storing. Open de statusdetails.",
    "Purifying · tap to inspect": "Zuiveren · tik voor details",
    "Flushing · tap to inspect": "Spoelen · tik voor details",
    "Service due": "Onderhoud nodig",
    "Service reminders: {count}": "Onderhoudsherinneringen: {count}",
    "Review plan status": "Planstatus controleren",
    "Filter plans: {count}": "Filterplannen: {count}",
    "State unavailable": "Status niet beschikbaar",
    "Updated just now": "Zojuist bijgewerkt",
    "Updated {count} min ago": "{count} min geleden bijgewerkt",
    "Via Home Assistant": "Via Home Assistant",
    "Waiting for history": "Wachten op geschiedenis",
    "Loading history…": "Geschiedenis laden…",
    "No recorded history": "Geen opgeslagen geschiedenis",
    "History unavailable": "Geschiedenis niet beschikbaar",
    "Live readings remain available.": "Live metingen blijven beschikbaar.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Opgeslagen TDS-verloop van gezuiverd water. Van {from} tot {to}. Onderbrekingen geven ontbrekende metingen aan.",
    "Recorded history · live reading unavailable": "Opgeslagen geschiedenis · live meting niet beschikbaar",
    "Gaps indicate unavailable readings": "Onderbrekingen geven niet-beschikbare metingen aan",
    "The mapped entity is not present in Home Assistant.": "De gekoppelde entiteit is niet aanwezig in Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "Koppel in de kaarteditor een gecontroleerde filterherinnering aan deze trap.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "Er is geen afzonderlijke statusentiteit gekoppeld. De controllerfase bewijst niet de fysieke toestand van het onderdeel.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "Automatische detectie niet beschikbaar. Handmatige entiteitskoppelingen blijven werken.",
    "{name} mapping mode": "Koppelingsmodus van {name}",
    "From filter list": "Uit filterlijst",
    "Automatic": "Automatisch",
    "Choose entity": "Entiteit kiezen",
    "Hide": "Verbergen",
    "{name} entity": "Entiteit van {name}",
    "Water quality & production": "Waterkwaliteit en productie",
    "Installed equipment & status": "Geïnstalleerde apparatuur en status",
    "Filter reminder entities": "Filterherinneringsentiteiten",
    "Device diagnostics": "Apparaatdiagnostiek",
    "Water Purifier Cards": "Waterzuiveraarkaarten",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Kies een WATER MQTT-apparaat of koppel entiteiten handmatig. Alle drie kaartformaten gebruiken dezelfde entiteitsinstellingen en hetzelfde JavaScript-bestand.",
    "Device": "Apparaat",
    "Manual entity mapping": "Handmatige entiteitskoppeling",
    "Saved device · {name}": "Opgeslagen apparaat · {name}",
    "Refresh devices": "Apparaten vernieuwen",
    "WATER devices found: {count}": "Gevonden WATER-apparaten: {count}",
    "Title": "Titel",
    "Card layout": "Kaartindeling",
    "Large · Full water circuit": "Groot · Volledig watercircuit",
    "Small · Device status": "Klein · Apparaatstatus",
    "Medium · Quality & history": "Middelgroot · Kwaliteit en geschiedenis",
    "Device dashboard URL (optional)": "URL apparaatdashboard (optioneel)",
    "Animate water paths (large card)": "Waterstromen animeren (grote kaart)",
    "Show recorded TDS history (medium / large)": "Opgeslagen TDS-geschiedenis tonen (middelgroot/groot)",
    "TDS history window (hours)": "TDS-geschiedenisvenster (uren)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "De kleine kaart vraagt nooit geschiedenis op. De gebruikstotalen van de middelgrote kaart zijn cumulatief en onafhankelijk van de periode van de TDS-grafiek. Stand-by bevestigt niet dat automatisch bedrijf is ingeschakeld.",
    "Physical filter → maintenance entity": "Fysiek filter → onderhoudsentiteit",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "De firmware ondersteunt acht herinneringsplaatsen. Koppel ze aan je geïnstalleerde filtertypen. Deze expliciete klikkoppelingen gaan vóór de onderstaande traptoewijzingen; ze wijzigen het leidingwerk niet.",
    "Filter names & circuit stages": "Filternamen en circuittrappen",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Geef de geïnstalleerde filters een naam en wijs hun werkelijke trappen toe. Als elk item een trap heeft, verschijnen alleen die typen in het circuit. Anders blijft het referentiecircuit met vijf trappen zichtbaar. Een lege lijst verbergt alleen herinneringen.",
    "Use a custom list": "Eigen lijst gebruiken",
    "Name": "Naam",
    "Entity": "Entiteit",
    "Circuit stage": "Circuittrap",
    "Not assigned": "Niet toegewezen",
    "Remove filter {count}": "Filter {count} verwijderen",
    "Add reminder": "Herinnering toevoegen",
    "Save reminder list": "Herinneringslijst opslaan",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Niet-gekoppelde optionele items worden weggelaten. Een gekoppelde entiteit die onbekend of niet beschikbaar wordt, blijft zichtbaar. Alleen de grote kaart bevat een circuit. Geen enkele kaart verstuurt apparaatcommando’s.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Kies een entiteit van het type sensor, binary_sensor, switch of een invoerhelper.",
    "Filter reminder": "Filterherinnering",
    "Language": "Taal",
    "Follow Home Assistant": "Home Assistant volgen",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "De taal volgt je Home Assistant-profiel, tenzij je een andere taal kiest. Eigen titels en filternamen blijven ongewijzigd.",
    "Water Purifier · Full": "Waterzuiveraar · Volledig",
    "Large card with the water circuit, readings, history and filter care.": "Grote kaart met watercircuit, metingen, geschiedenis en filteronderhoud.",
    "Water Purifier · Status": "Waterzuiveraar · Status",
    "Small home card: operating state, product TDS and flow.": "Kleine startkaart: bedrijfsstatus, TDS van gezuiverd water en debiet.",
    "Water Purifier · History": "Waterzuiveraar · Geschiedenis",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Middelgrote kaart: waterkwaliteit, opgeslagen TDS-verloop, cumulatief gebruik en filterherinneringen."
  },
  "zh-Hant": {
    "Water purifier": "淨水器",
    "Control state": "控制狀態",
    "Fault": "故障",
    "Feed water": "原水",
    "Product water": "純水",
    "Feed temperature": "原水溫度",
    "Product temperature": "純水溫度",
    "Product flow": "純水流量",
    "Concentrate flow": "濃水流量",
    "Product total": "累計純水量",
    "Concentrate total": "累計濃水量",
    "RO recovery": "RO 回收率",
    "Production time": "累計製水時間",
    "Uptime": "開機時間",
    "Output capability": "輸出權限",
    "Pump voltage · uncalibrated": "水泵電壓 · 未校準",
    "Pump current · uncalibrated": "水泵電流 · 未校準",
    "UVC voltage · uncalibrated": "UVC 電壓 · 未校準",
    "UVC current · uncalibrated": "UVC 電流 · 未校準",
    "Production starts": "製水啟動次數",
    "Fault count": "故障次數",
    "Filter {count} reminder": "濾芯 {count} 提醒",
    "Booster pump": "增壓泵",
    "Inlet valve": "進水閥",
    "Flush valve": "沖洗閥",
    "UV output command": "UV 輸出命令",
    "UV installed and enabled": "UV 已安裝並啟用",
    "UV controller status": "UV 控制器狀態",
    "Pressure": "壓力",
    "Leak detector": "漏水感測器",
    "Sediment prefilter": "前置沉積物濾芯",
    "Granular carbon prefilter": "前置顆粒活性碳濾芯",
    "Carbon block prefilter": "前置壓縮活性碳濾芯",
    "Reverse osmosis membrane": "逆滲透膜",
    "Post carbon filter": "後置活性碳濾芯",
    "Installation required": "需要設定安裝資訊",
    "Idle": "閒置",
    "Opening inlet": "正在開啟進水閥",
    "Preflushing": "前沖洗中",
    "Purifying": "製水中",
    "Postflushing": "後沖洗中",
    "Maintenance": "維護中",
    "Flushing": "沖洗中",
    "Output test": "輸出測試",
    "No fault": "無故障",
    "Disabled": "已停用",
    "Replacement not recorded": "尚未記錄更換",
    "Replacement due": "已到更換期限",
    "Date unknown": "日期未知",
    "In service": "使用中",
    "Not fitted": "未安裝",
    "Commanded on": "開啟命令",
    "Enabled": "已啟用",
    "Controller outputs permitted": "控制器輸出已允許",
    "Outputs locked": "輸出已鎖定",
    "Configuration fault": "設定故障",
    "Clock fault": "時鐘故障",
    "Control deadline missed": "控制處理逾時",
    "Invalid input": "輸入無效",
    "Stale input": "輸入資料過期",
    "No water supply": "無供水",
    "Protection input active": "保護輸入已觸發",
    "Cycle time exceeded": "運轉週期逾時",
    "On": "開啟",
    "Off": "關閉",
    "UV current below limit": "UV 電流低於下限",
    "UV current above limit": "UV 電流超過上限",
    "Unexpected current while UV is off": "UV 關閉時偵測到異常電流",
    "UV electrical feedback unavailable": "UV 電氣回授不可用",
    "UV configuration required": "需要設定 UV",
    "UV feedback unavailable": "UV 回授不可用",
    "{name} must be a mapping.": "{name} 必須是對應表。",
    "Unknown {name} key: {key}": "未知的 {name} 鍵值：{key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}：請選擇實體 ID，或填入 null 以隱藏。",
    "Card configuration must be an object.": "卡片設定必須是物件。",
    "Choose a Water Purifier full, status or history card type.": "請選擇淨水器完整、狀態或歷史卡片類型。",
    "Title must be at most 100 characters.": "標題最多 100 個字元。",
    "Layout must be full, small or medium.": "版面必須是 full、small 或 medium。",
    "{name} must be true or false.": "{name} 必須是 true 或 false。",
    "history_hours must be an integer from 1 to 24.": "history_hours 必須是 1 到 24 的整數。",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url 必須是 http:// 或 https:// 網址，且不可包含帳號密碼。",
    "device_id must be a Home Assistant device registry ID.": "device_id 必須是 Home Assistant 裝置登錄 ID。",
    "filters must be an array with at most eight entries.": "filters 必須是陣列，最多包含 8 筆資料。",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "濾芯 {count} 需要名稱（1–60 個字元）及實體 ID。",
    "Filter stage must be pp, udf, cto, ro, or post.": "濾芯階段必須是 pp、udf、cto、ro 或 post。",
    "Choose a supported language, or auto to follow Home Assistant.": "請選擇支援的語言，或使用 auto 跟隨 Home Assistant。",
    "Not mapped": "未對應",
    "HA disconnected": "HA 已斷線",
    "Entity not found": "找不到實體",
    "Unavailable": "不可用",
    "Unknown": "未知",
    "Device discovery is unavailable. Map entities manually.": "裝置探索不可用，請手動對應實體。",
    "Unexpected registry response. Map entities manually.": "裝置登錄回應異常，請手動對應實體。",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "選取的裝置沒有唯一的 WATER MQTT 識別碼，請手動對應實體。",
    "Could not discover entities. Use manual mappings.": "無法探索實體，請改用手動對應。",
    "PP sediment filter": "PP 沉積物濾芯",
    "UDF granular carbon filter": "UDF 顆粒活性碳濾芯",
    "CTO carbon block filter": "CTO 壓縮活性碳濾芯",
    "RO membrane": "RO 膜",
    "T33 post carbon filter": "T33 後置活性碳濾芯",
    "Waste valve": "廢水閥",
    "UV lamp": "UV 燈",
    "Concentrate": "濃水",
    "{name} details": "{name} 詳情",
    "Inlet": "進水",
    "Pump": "水泵",
    "Feed": "原水",
    "Product": "純水",
    "Water circuit diagram": "水路示意圖",
    "Water circuit": "水路",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "水路：原水經過已設定的前置濾芯、進水閥及水泵，到達膜的分流處。純水通過已設定的後置濾芯；濃水由廢水支路排出。",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "水路：原水經過已設定的前置濾芯、進水閥及水泵，到達膜的分流處。純水通過已設定的後置濾芯及 UV 燈；濃水由廢水支路排出。",
    "Total produced": "累計製水量",
    "Temperature": "溫度",
    "UV fault": "UV 故障",
    "UV commanded on": "UV 開啟命令",
    "UV commanded off": "UV 關閉命令",
    "UV disabled": "UV 已停用",
    "UV setup required": "需要設定 UV",
    "UV status unknown": "UV 狀態未知",
    "Home Assistant disconnected": "Home Assistant 已斷線",
    "Set up device": "設定裝置",
    "Select a device or map its state": "請選擇裝置或對應狀態實體",
    "State entity not found": "找不到狀態實體",
    "Device state unavailable": "裝置狀態不可用",
    "Needs attention": "需要檢查",
    "Controller reports a fault": "控制器回報故障",
    "Status unknown": "狀態未知",
    "Fault status unavailable": "故障狀態不可用",
    "Standby": "待機",
    "Locked": "已鎖定",
    "Starting": "啟動中",
    "Pre-rinse": "前沖洗",
    "Post-rinse": "後沖洗",
    "Rinsing": "沖洗中",
    "Not producing": "未製水",
    "Open controller for details": "開啟控制器頁面查看詳情",
    "Flow unavailable": "流量不可用",
    "Waste total": "累計廢水量",
    "Starts": "啟動次數",
    "Product TDS": "純水 TDS",
    "Feed TDS": "原水 TDS",
    "Retry discovery": "重新探索",
    "Waiting": "等待中",
    "Last {count} hours": "最近 {count} 小時",
    "Last hour": "最近 1 小時",
    "History ↗": "歷史記錄 ↗",
    "Product TDS history": "純水 TDS 歷史記錄",
    "Cumulative usage, independent of the chart time range": "累計用量，與圖表時間範圍無關",
    "Usage history": "用量記錄",
    "Cumulative": "累計",
    "{name} details, accumulated commanded production time": "{name} 詳情，累計製水命令持續時間",
    "Filter care": "濾芯保養",
    "Loading device entities…": "正在載入裝置實體…",
    "Live": "即時",
    "Latest reading": "最新讀數",
    "Open details": "開啟詳情",
    "Device data unavailable": "裝置資料不可用",
    "Reminder off": "提醒已關閉",
    "{name} · Replacement due": "{name} · 已到更換期限",
    "Due: {count}": "已到期：{count}",
    "Unknown: {count}": "未知：{count}",
    "Review": "檢查",
    "Reminders are off": "提醒已全部關閉",
    "{name} · Reminder off": "{name} · 提醒已關閉",
    "Off: {count}": "已關閉：{count}",
    "No installed filters in this list": "此清單中沒有已安裝的濾芯",
    "No replacement reminders due": "尚無到期的更換提醒",
    "Plans: {count}": "計畫：{count}",
    "Filter {count}": "濾芯 {count}",
    "Not configured": "尚未設定",
    "Map product TDS to see water quality.": "對應純水 TDS 實體即可查看水質。",
    "WATER CIRCUIT": "水路",
    "Tap a component to inspect": "點選部件查看詳情",
    "Close component details": "關閉部件詳情",
    "More readings & diagnostics": "更多讀數與診斷",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "此卡片僅供查看。水流動畫依控制器階段顯示，不代表實際流量或閥門回授。UV 命令無法證明消毒效果。濾芯提醒來自回報的計畫狀態，不是剩餘壽命估算。水路階段依卡片設定顯示；MQTT 不回報濾芯類型或管路配置。歷史資料來自 Home Assistant Recorder。",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "請在卡片編輯器選擇 WATER 裝置，或對應 Home Assistant 實體。",
    "Waiting for Home Assistant": "正在等待 Home Assistant",
    "Open device dashboard ↗": "開啟裝置管理頁面 ↗",
    "Controller details ↗": "控制器詳情 ↗",
    "State not mapped": "狀態尚未對應",
    "Device fault · {name}": "裝置故障 · {name}",
    "Controller stopped by a fault. Open state details.": "控制器因故障停止，請開啟狀態詳情。",
    "Purifying · tap to inspect": "製水中 · 點選查看",
    "Flushing · tap to inspect": "沖洗中 · 點選查看",
    "Service due": "保養到期",
    "Service reminders: {count}": "保養提醒：{count}",
    "Review plan status": "檢查計畫狀態",
    "Filter plans: {count}": "濾芯計畫：{count}",
    "State unavailable": "狀態不可用",
    "Updated just now": "剛剛更新",
    "Updated {count} min ago": "{count} 分鐘前更新",
    "Via Home Assistant": "透過 Home Assistant",
    "Waiting for history": "正在等待歷史資料",
    "Loading history…": "正在載入歷史資料…",
    "No recorded history": "尚無歷史記錄",
    "History unavailable": "歷史資料不可用",
    "Live readings remain available.": "即時讀數仍可使用。",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "純水 TDS 歷史趨勢，從 {from} 到 {to}。空白區段表示缺少讀數。",
    "Recorded history · live reading unavailable": "歷史記錄 · 即時讀數不可用",
    "Gaps indicate unavailable readings": "空白區段表示讀數不可用",
    "The mapped entity is not present in Home Assistant.": "Home Assistant 中沒有此對應實體。",
    "Assign a verified filter reminder to this stage in the card editor.": "請在卡片編輯器中，為此階段對應已確認的濾芯提醒實體。",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "尚未對應獨立狀態實體。控制器階段無法證明部件的實際狀態。",
    "Automatic discovery unavailable. Manual entity mappings still work.": "自動探索不可用，仍可手動對應實體。",
    "{name} mapping mode": "{name} 對應方式",
    "From filter list": "依濾芯清單",
    "Automatic": "自動",
    "Choose entity": "選擇實體",
    "Hide": "隱藏",
    "{name} entity": "{name} 實體",
    "Water quality & production": "水質與製水",
    "Installed equipment & status": "已安裝設備與狀態",
    "Filter reminder entities": "濾芯提醒實體",
    "Device diagnostics": "裝置診斷",
    "Water Purifier Cards": "淨水器卡片",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "請選擇 WATER MQTT 裝置，或手動對應實體。三種卡片尺寸共用相同的實體設定方式與 JavaScript 資源。",
    "Device": "裝置",
    "Manual entity mapping": "手動對應實體",
    "Saved device · {name}": "已儲存裝置 · {name}",
    "Refresh devices": "重新整理裝置",
    "WATER devices found: {count}": "找到的 WATER 裝置：{count}",
    "Title": "標題",
    "Card layout": "卡片版面",
    "Large · Full water circuit": "大卡 · 完整水路",
    "Small · Device status": "小卡 · 裝置狀態",
    "Medium · Quality & history": "中卡 · 水質與歷史",
    "Device dashboard URL (optional)": "裝置管理頁面網址（選填）",
    "Animate water paths (large card)": "顯示水流動畫（大卡）",
    "Show recorded TDS history (medium / large)": "顯示 TDS 歷史記錄（中卡／大卡）",
    "TDS history window (hours)": "TDS 歷史時間範圍（小時）",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "小卡不會請求歷史資料。中卡的用量為累計數值，與 TDS 圖表時間範圍無關。待機狀態不代表自動運轉已啟用。",
    "Physical filter → maintenance entity": "實體濾芯 → 保養實體",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "韌體支援 8 個提醒欄位，請依實際安裝的濾芯類型對應。此處指定的點選對應優先於下方的階段設定，不會改變實際管路。",
    "Filter names & circuit stages": "濾芯名稱與水路階段",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "請為已安裝的濾芯命名，並指定實際階段。若每筆資料都有階段，水路只顯示這些階段類型；否則保留五級參考水路。空白清單只會隱藏提醒。",
    "Use a custom list": "使用自訂清單",
    "Name": "名稱",
    "Entity": "實體",
    "Circuit stage": "水路階段",
    "Not assigned": "未指定",
    "Remove filter {count}": "移除濾芯 {count}",
    "Add reminder": "新增提醒",
    "Save reminder list": "儲存提醒清單",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "未對應的選用項目不會顯示。已對應的實體即使變成未知或不可用，仍會保留顯示。只有大卡包含水路圖。所有卡片都不會傳送裝置控制命令。",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "請選擇 sensor、binary_sensor、switch 或輸入輔助實體。",
    "Filter reminder": "濾芯提醒",
    "Language": "語言",
    "Follow Home Assistant": "跟隨 Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "預設使用 Home Assistant 個人資料中的語言，也可在此手動指定。自訂標題和濾芯名稱會保留原文。",
    "Water Purifier · Full": "淨水器 · 完整",
    "Large card with the water circuit, readings, history and filter care.": "大卡：包含水路、讀數、歷史記錄與濾芯保養。",
    "Water Purifier · Status": "淨水器 · 狀態",
    "Small home card: operating state, product TDS and flow.": "首頁小卡：運轉狀態、純水 TDS 和流量。",
    "Water Purifier · History": "淨水器 · 歷史",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "中卡：水質、TDS 歷史趨勢、累計用量與濾芯提醒。"
  },
  "pt-BR": {
    "Water purifier": "Purificador de água",
    "Control state": "Estado de controle",
    "Fault": "Falha",
    "Feed water": "Água de entrada",
    "Product water": "Água purificada",
    "Feed temperature": "Temperatura de entrada",
    "Product temperature": "Temperatura da água purificada",
    "Product flow": "Vazão de água purificada",
    "Concentrate flow": "Vazão de rejeito",
    "Product total": "Total de água purificada",
    "Concentrate total": "Total de rejeito",
    "RO recovery": "Recuperação de água RO",
    "Production time": "Tempo de produção",
    "Uptime": "Tempo ligado",
    "Output capability": "Permissão das saídas",
    "Pump voltage · uncalibrated": "Tensão da bomba · sem calibração",
    "Pump current · uncalibrated": "Corrente da bomba · sem calibração",
    "UVC voltage · uncalibrated": "Tensão UVC · sem calibração",
    "UVC current · uncalibrated": "Corrente UVC · sem calibração",
    "Production starts": "Inícios de produção",
    "Fault count": "Contagem de falhas",
    "Filter {count} reminder": "Lembrete do filtro {count}",
    "Booster pump": "Bomba pressurizadora",
    "Inlet valve": "Válvula de entrada",
    "Flush valve": "Válvula de enxágue",
    "UV output command": "Comando da saída UV",
    "UV installed and enabled": "UV instalado e habilitado",
    "UV controller status": "Estado do controlador UV",
    "Pressure": "Pressão",
    "Leak detector": "Sensor de vazamento",
    "Sediment prefilter": "Pré-filtro de sedimentos",
    "Granular carbon prefilter": "Pré-filtro de carvão granulado",
    "Carbon block prefilter": "Pré-filtro de carvão em bloco",
    "Reverse osmosis membrane": "Membrana de osmose reversa",
    "Post carbon filter": "Pós-filtro de carvão",
    "Installation required": "Configuração da instalação necessária",
    "Idle": "Ocioso",
    "Opening inlet": "Abrindo entrada",
    "Preflushing": "Pré-enxágue",
    "Purifying": "Purificando",
    "Postflushing": "Pós-enxágue",
    "Maintenance": "Manutenção",
    "Flushing": "Enxaguando",
    "Output test": "Teste de saída",
    "No fault": "Sem falhas",
    "Disabled": "Desabilitado",
    "Replacement not recorded": "Troca não registrada",
    "Replacement due": "Troca necessária",
    "Date unknown": "Data desconhecida",
    "In service": "Em uso",
    "Not fitted": "Não instalado",
    "Commanded on": "Comando de ligar",
    "Enabled": "Habilitado",
    "Controller outputs permitted": "Saídas do controlador permitidas",
    "Outputs locked": "Saídas bloqueadas",
    "Configuration fault": "Falha de configuração",
    "Clock fault": "Falha de relógio",
    "Control deadline missed": "Prazo de controle excedido",
    "Invalid input": "Entrada inválida",
    "Stale input": "Entrada desatualizada",
    "No water supply": "Sem abastecimento",
    "Protection input active": "Entrada de proteção acionada",
    "Cycle time exceeded": "Tempo do ciclo excedido",
    "On": "Ligado",
    "Off": "Desligado",
    "UV current below limit": "Corrente UV abaixo do limite",
    "UV current above limit": "Corrente UV acima do limite",
    "Unexpected current while UV is off": "Corrente inesperada com UV desligado",
    "UV electrical feedback unavailable": "Leitura elétrica UV indisponível",
    "UV configuration required": "Configuração UV necessária",
    "UV feedback unavailable": "Leitura UV indisponível",
    "{name} must be a mapping.": "{name} deve ser um mapeamento.",
    "Unknown {name} key: {key}": "Chave desconhecida em {name}: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: selecione um ID de entidade ou null para ocultar.",
    "Card configuration must be an object.": "A configuração do cartão deve ser um objeto.",
    "Choose a Water Purifier full, status or history card type.": "Escolha um cartão de purificador completo, de estado ou de histórico.",
    "Title must be at most 100 characters.": "O título deve ter no máximo 100 caracteres.",
    "Layout must be full, small or medium.": "O layout deve ser full, small ou medium.",
    "{name} must be true or false.": "{name} deve ser true ou false.",
    "history_hours must be an integer from 1 to 24.": "history_hours deve ser um número inteiro de 1 a 24.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url deve ser uma URL http:// ou https:// sem credenciais.",
    "device_id must be a Home Assistant device registry ID.": "device_id deve ser um ID do registro de dispositivos do Home Assistant.",
    "filters must be an array with at most eight entries.": "filters deve ser uma lista com no máximo oito itens.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "O filtro {count} precisa de nome (1–60 caracteres) e ID de entidade.",
    "Filter stage must be pp, udf, cto, ro, or post.": "O estágio do filtro deve ser pp, udf, cto, ro ou post.",
    "Choose a supported language, or auto to follow Home Assistant.": "Escolha um idioma disponível ou auto para seguir o Home Assistant.",
    "Not mapped": "Sem mapeamento",
    "HA disconnected": "HA desconectado",
    "Entity not found": "Entidade não encontrada",
    "Unavailable": "Indisponível",
    "Unknown": "Desconhecido",
    "Device discovery is unavailable. Map entities manually.": "A descoberta de dispositivos está indisponível. Mapeie as entidades manualmente.",
    "Unexpected registry response. Map entities manually.": "Resposta inesperada do registro. Mapeie as entidades manualmente.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "O dispositivo selecionado não tem identificador WATER MQTT único. Mapeie as entidades manualmente.",
    "Could not discover entities. Use manual mappings.": "Não foi possível descobrir entidades. Use o mapeamento manual.",
    "PP sediment filter": "Filtro de sedimentos PP",
    "UDF granular carbon filter": "Filtro de carvão granulado UDF",
    "CTO carbon block filter": "Filtro de carvão em bloco CTO",
    "RO membrane": "Membrana RO",
    "T33 post carbon filter": "Pós-filtro de carvão T33",
    "Waste valve": "Válvula de rejeito",
    "UV lamp": "Lâmpada UV",
    "Concentrate": "Rejeito",
    "{name} details": "Detalhes de {name}",
    "Inlet": "Entrada",
    "Pump": "Bomba",
    "Feed": "Entrada",
    "Product": "Água purificada",
    "Water circuit diagram": "Diagrama do circuito de água",
    "Water circuit": "Circuito de água",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "Circuito de água. A água de entrada passa pelos pré-filtros configurados, pela válvula de entrada e pela bomba até a divisão na membrana. A água purificada passa pelo pós-filtro configurado; o rejeito sai pelo ramal de descarte.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "Circuito de água. A água de entrada passa pelos pré-filtros configurados, pela válvula de entrada e pela bomba até a divisão na membrana. A água purificada passa pelo pós-filtro e pela lâmpada UV configurados; o rejeito sai pelo ramal de descarte.",
    "Total produced": "Total produzido",
    "Temperature": "Temperatura",
    "UV fault": "Falha UV",
    "UV commanded on": "UV: comando de ligar",
    "UV commanded off": "UV: comando de desligar",
    "UV disabled": "UV desabilitado",
    "UV setup required": "Configurar UV",
    "UV status unknown": "Estado UV desconhecido",
    "Home Assistant disconnected": "Home Assistant desconectado",
    "Set up device": "Configurar dispositivo",
    "Select a device or map its state": "Selecione um dispositivo ou mapeie seu estado",
    "State entity not found": "Entidade de estado não encontrada",
    "Device state unavailable": "Estado do dispositivo indisponível",
    "Needs attention": "Requer atenção",
    "Controller reports a fault": "Controlador informa uma falha",
    "Status unknown": "Estado desconhecido",
    "Fault status unavailable": "Estado de falha indisponível",
    "Standby": "Em espera",
    "Locked": "Bloqueado",
    "Starting": "Iniciando",
    "Pre-rinse": "Pré-enxágue",
    "Post-rinse": "Pós-enxágue",
    "Rinsing": "Enxaguando",
    "Not producing": "Sem produção",
    "Open controller for details": "Abra o painel do controlador",
    "Flow unavailable": "Vazão indisponível",
    "Waste total": "Total de rejeito",
    "Starts": "Partidas",
    "Product TDS": "TDS da água purificada",
    "Feed TDS": "TDS de entrada",
    "Retry discovery": "Repetir descoberta",
    "Waiting": "Aguardando",
    "Last {count} hours": "Últimas {count} horas",
    "Last hour": "Última hora",
    "History ↗": "Histórico ↗",
    "Product TDS history": "Histórico de TDS da água purificada",
    "Cumulative usage, independent of the chart time range": "Uso acumulado, independente do período do gráfico",
    "Usage history": "Histórico de uso",
    "Cumulative": "Acumulado",
    "{name} details, accumulated commanded production time": "Detalhes de {name}, tempo acumulado de comando de produção",
    "Filter care": "Cuidados com filtros",
    "Loading device entities…": "Carregando entidades do dispositivo…",
    "Live": "Em tempo real",
    "Latest reading": "Última leitura",
    "Open details": "Abrir detalhes",
    "Device data unavailable": "Dados do dispositivo indisponíveis",
    "Reminder off": "Lembrete desativado",
    "{name} · Replacement due": "{name} · Troca necessária",
    "Due: {count}": "Trocas pendentes: {count}",
    "Unknown: {count}": "Desconhecidos: {count}",
    "Review": "Revisar",
    "Reminders are off": "Lembretes desativados",
    "{name} · Reminder off": "{name} · Lembrete desativado",
    "Off: {count}": "Desativados: {count}",
    "No installed filters in this list": "Nenhum filtro instalado nesta lista",
    "No replacement reminders due": "Nenhuma troca pendente",
    "Plans: {count}": "Planos: {count}",
    "Filter {count}": "Filtro {count}",
    "Not configured": "Não configurado",
    "Map product TDS to see water quality.": "Mapeie o TDS da água purificada para ver a qualidade da água.",
    "WATER CIRCUIT": "CIRCUITO DE ÁGUA",
    "Tap a component to inspect": "Toque em um componente para inspecionar",
    "Close component details": "Fechar detalhes do componente",
    "More readings & diagnostics": "Mais leituras e diagnósticos",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "Somente leitura. A animação segue a fase do controlador; não é uma medição de vazão nem retorno das válvulas. O comando UV não comprova a desinfecção. Os lembretes mostram o estado dos planos, não uma estimativa de vida útil restante. As etapas do circuito seguem a configuração do cartão; o MQTT não informa tipos de filtro nem tubulação. O histórico vem do Recorder do Home Assistant.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "Escolha seu dispositivo WATER no editor do cartão ou mapeie entidades do Home Assistant.",
    "Waiting for Home Assistant": "Aguardando Home Assistant",
    "Open device dashboard ↗": "Abrir painel do dispositivo ↗",
    "Controller details ↗": "Detalhes do controlador ↗",
    "State not mapped": "Estado não mapeado",
    "Device fault · {name}": "Falha do dispositivo · {name}",
    "Controller stopped by a fault. Open state details.": "Controlador parado por uma falha. Abra os detalhes do estado.",
    "Purifying · tap to inspect": "Purificando · toque para inspecionar",
    "Flushing · tap to inspect": "Enxaguando · toque para inspecionar",
    "Service due": "Manutenção necessária",
    "Service reminders: {count}": "Lembretes de manutenção: {count}",
    "Review plan status": "Revisar estado dos planos",
    "Filter plans: {count}": "Planos de filtro: {count}",
    "State unavailable": "Estado indisponível",
    "Updated just now": "Atualizado agora",
    "Updated {count} min ago": "Atualizado há {count} min",
    "Via Home Assistant": "Via Home Assistant",
    "Waiting for history": "Aguardando histórico",
    "Loading history…": "Carregando histórico…",
    "No recorded history": "Nenhum histórico registrado",
    "History unavailable": "Histórico indisponível",
    "Live readings remain available.": "As leituras em tempo real continuam disponíveis.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "Tendência registrada de TDS da água purificada, de {from} a {to}. Lacunas indicam leituras ausentes.",
    "Recorded history · live reading unavailable": "Histórico registrado · leitura atual indisponível",
    "Gaps indicate unavailable readings": "Lacunas indicam leituras indisponíveis",
    "The mapped entity is not present in Home Assistant.": "A entidade mapeada não está presente no Home Assistant.",
    "Assign a verified filter reminder to this stage in the card editor.": "No editor do cartão, associe a este estágio um lembrete de filtro que você tenha verificado.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "Nenhuma entidade de estado individual está mapeada. A fase do controlador não comprova o estado físico do componente.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "A descoberta automática está indisponível. O mapeamento manual de entidades continua disponível.",
    "{name} mapping mode": "Modo de mapeamento de {name}",
    "From filter list": "Da lista de filtros",
    "Automatic": "Automático",
    "Choose entity": "Escolher entidade",
    "Hide": "Ocultar",
    "{name} entity": "Entidade de {name}",
    "Water quality & production": "Qualidade da água e produção",
    "Installed equipment & status": "Equipamentos instalados e estado",
    "Filter reminder entities": "Entidades de lembrete dos filtros",
    "Device diagnostics": "Diagnóstico do dispositivo",
    "Water Purifier Cards": "Cartões do purificador de água",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "Escolha um dispositivo WATER MQTT ou mapeie as entidades manualmente. Os três tamanhos de cartão usam as mesmas opções de entidades e o mesmo recurso JavaScript.",
    "Device": "Dispositivo",
    "Manual entity mapping": "Mapeamento manual de entidades",
    "Saved device · {name}": "Dispositivo salvo · {name}",
    "Refresh devices": "Atualizar dispositivos",
    "WATER devices found: {count}": "Dispositivos WATER encontrados: {count}",
    "Title": "Título",
    "Card layout": "Layout do cartão",
    "Large · Full water circuit": "Grande · Circuito completo",
    "Small · Device status": "Pequeno · Estado do dispositivo",
    "Medium · Quality & history": "Médio · Qualidade e histórico",
    "Device dashboard URL (optional)": "URL do painel do dispositivo (opcional)",
    "Animate water paths (large card)": "Animar o fluxo de água (cartão grande)",
    "Show recorded TDS history (medium / large)": "Mostrar histórico de TDS (médio / grande)",
    "TDS history window (hours)": "Período do histórico de TDS (horas)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "O cartão pequeno não solicita histórico. Os totais de uso do cartão médio são acumulados e independem do período do gráfico de TDS. O estado de espera não confirma que a operação automática está habilitada.",
    "Physical filter → maintenance entity": "Filtro físico → entidade de manutenção",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "O firmware oferece oito posições de lembrete. Associe-as aos tipos de filtro instalados. Estes mapeamentos explícitos de clique têm prioridade sobre as etapas definidas abaixo; eles não alteram a tubulação.",
    "Filter names & circuit stages": "Nomes dos filtros e etapas do circuito",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "Nomeie os filtros instalados e atribua suas etapas reais. Se todos os itens tiverem uma etapa, o circuito mostrará apenas esses tipos. Caso contrário, permanecerá o circuito de referência com cinco etapas. Uma lista vazia oculta apenas os lembretes.",
    "Use a custom list": "Usar lista personalizada",
    "Name": "Nome",
    "Entity": "Entidade",
    "Circuit stage": "Etapa do circuito",
    "Not assigned": "Não atribuído",
    "Remove filter {count}": "Remover filtro {count}",
    "Add reminder": "Adicionar lembrete",
    "Save reminder list": "Salvar lista de lembretes",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "Itens opcionais não mapeados são omitidos. Entidades mapeadas que ficam desconhecidas ou indisponíveis continuam visíveis. Apenas o cartão grande inclui o circuito. Nenhum cartão envia comandos ao dispositivo.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "Escolha uma entidade sensor, binary_sensor, switch ou auxiliar de entrada.",
    "Filter reminder": "Lembrete de filtro",
    "Language": "Idioma",
    "Follow Home Assistant": "Seguir Home Assistant",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "O idioma segue seu perfil do Home Assistant, a menos que você escolha outro. Títulos e nomes de filtros personalizados são mantidos como digitados.",
    "Water Purifier · Full": "Purificador de água · Completo",
    "Large card with the water circuit, readings, history and filter care.": "Cartão grande com circuito de água, leituras, histórico e cuidados com filtros.",
    "Water Purifier · Status": "Purificador de água · Estado",
    "Small home card: operating state, product TDS and flow.": "Cartão pequeno para o painel inicial: estado de operação, TDS da água purificada e vazão.",
    "Water Purifier · History": "Purificador de água · Histórico",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "Cartão médio: qualidade da água, tendência registrada de TDS, uso acumulado e lembretes dos filtros."
  },
  "ja": {
    "Water purifier": "浄水器",
    "Control state": "制御状態",
    "Fault": "異常",
    "Feed water": "原水",
    "Product water": "浄水",
    "Feed temperature": "原水温度",
    "Product temperature": "浄水温度",
    "Product flow": "浄水流量",
    "Concentrate flow": "濃縮水流量",
    "Product total": "累計浄水量",
    "Concentrate total": "累計濃縮水量",
    "RO recovery": "RO 回収率",
    "Production time": "累計浄水運転時間",
    "Uptime": "稼働時間",
    "Output capability": "出力許可",
    "Pump voltage · uncalibrated": "ポンプ電圧・未校正",
    "Pump current · uncalibrated": "ポンプ電流・未校正",
    "UVC voltage · uncalibrated": "UVC 電圧・未校正",
    "UVC current · uncalibrated": "UVC 電流・未校正",
    "Production starts": "浄水運転開始回数",
    "Fault count": "異常回数",
    "Filter {count} reminder": "フィルター {count} の交換通知",
    "Booster pump": "加圧ポンプ",
    "Inlet valve": "給水弁",
    "Flush valve": "洗浄弁",
    "UV output command": "UV 出力指令",
    "UV installed and enabled": "UV 設置済み・有効",
    "UV controller status": "UV 制御状態",
    "Pressure": "圧力",
    "Leak detector": "漏水センサー",
    "Sediment prefilter": "前段沈殿物フィルター",
    "Granular carbon prefilter": "前段粒状活性炭フィルター",
    "Carbon block prefilter": "前段カーボンブロックフィルター",
    "Reverse osmosis membrane": "逆浸透膜",
    "Post carbon filter": "後段活性炭フィルター",
    "Installation required": "設置設定が必要",
    "Idle": "待機",
    "Opening inlet": "給水弁を開放中",
    "Preflushing": "前洗浄中",
    "Purifying": "浄水運転中",
    "Postflushing": "後洗浄中",
    "Maintenance": "メンテナンス中",
    "Flushing": "洗浄中",
    "Output test": "出力テスト",
    "No fault": "異常なし",
    "Disabled": "無効",
    "Replacement not recorded": "交換記録なし",
    "Replacement due": "交換時期",
    "Date unknown": "日付不明",
    "In service": "使用中",
    "Not fitted": "未設置",
    "Commanded on": "オン指令",
    "Enabled": "有効",
    "Controller outputs permitted": "制御出力許可",
    "Outputs locked": "出力ロック中",
    "Configuration fault": "設定異常",
    "Clock fault": "時計異常",
    "Control deadline missed": "制御処理の期限超過",
    "Invalid input": "入力が無効",
    "Stale input": "入力データが古い",
    "No water supply": "給水なし",
    "Protection input active": "保護入力が作動",
    "Cycle time exceeded": "運転時間超過",
    "On": "オン",
    "Off": "オフ",
    "UV current below limit": "UV 電流が下限未満",
    "UV current above limit": "UV 電流が上限超過",
    "Unexpected current while UV is off": "UV オフ時に異常電流",
    "UV electrical feedback unavailable": "UV 電気計測値を取得不可",
    "UV configuration required": "UV 設定が必要",
    "UV feedback unavailable": "UV 計測値を取得不可",
    "{name} must be a mapping.": "{name} はマッピングで指定してください。",
    "Unknown {name} key: {key}": "{name} の不明なキー: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: エンティティ ID を選択するか、非表示にするには null を指定してください。",
    "Card configuration must be an object.": "カード設定はオブジェクトで指定してください。",
    "Choose a Water Purifier full, status or history card type.": "浄水器カードの全体表示、状態、履歴のいずれかを選んでください。",
    "Title must be at most 100 characters.": "タイトルは 100 文字以内で指定してください。",
    "Layout must be full, small or medium.": "layout は full、small、medium のいずれかにしてください。",
    "{name} must be true or false.": "{name} は true または false で指定してください。",
    "history_hours must be an integer from 1 to 24.": "history_hours は 1〜24 の整数で指定してください。",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url は認証情報を含まない http:// または https:// の URL にしてください。",
    "device_id must be a Home Assistant device registry ID.": "device_id は Home Assistant のデバイスレジストリ ID にしてください。",
    "filters must be an array with at most eight entries.": "filters は最大 8 項目の配列で指定してください。",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "フィルター {count} には名前（1〜60 文字）とエンティティ ID が必要です。",
    "Filter stage must be pp, udf, cto, ro, or post.": "フィルター段階は pp、udf、cto、ro、post のいずれかにしてください。",
    "Choose a supported language, or auto to follow Home Assistant.": "対応言語を選ぶか、Home Assistant に合わせるには auto を指定してください。",
    "Not mapped": "未割り当て",
    "HA disconnected": "HA 切断中",
    "Entity not found": "エンティティが見つかりません",
    "Unavailable": "取得不可",
    "Unknown": "不明",
    "Device discovery is unavailable. Map entities manually.": "デバイス検出を利用できません。エンティティを手動で割り当ててください。",
    "Unexpected registry response. Map entities manually.": "レジストリの応答が不正です。エンティティを手動で割り当ててください。",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "選択したデバイスに一意の WATER MQTT 識別子がありません。エンティティを手動で割り当ててください。",
    "Could not discover entities. Use manual mappings.": "エンティティを検出できませんでした。手動で割り当ててください。",
    "PP sediment filter": "PP 沈殿物フィルター",
    "UDF granular carbon filter": "UDF 粒状活性炭フィルター",
    "CTO carbon block filter": "CTO カーボンブロックフィルター",
    "RO membrane": "RO 膜",
    "T33 post carbon filter": "T33 後段活性炭フィルター",
    "Waste valve": "排水弁",
    "UV lamp": "UV ランプ",
    "Concentrate": "濃縮水",
    "{name} details": "{name} の詳細",
    "Inlet": "給水",
    "Pump": "ポンプ",
    "Feed": "原水",
    "Product": "浄水",
    "Water circuit diagram": "水路図",
    "Water circuit": "水路",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "水路。原水は設定された前段フィルター、給水弁、ポンプを通り、膜の分岐へ進みます。浄水は設定された後段フィルターを通り、濃縮水は排水側へ流れます。",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "水路。原水は設定された前段フィルター、給水弁、ポンプを通り、膜の分岐へ進みます。浄水は設定された後段フィルターと UV ランプを通り、濃縮水は排水側へ流れます。",
    "Total produced": "累計浄水量",
    "Temperature": "温度",
    "UV fault": "UV 異常",
    "UV commanded on": "UV 点灯指令",
    "UV commanded off": "UV 消灯指令",
    "UV disabled": "UV 無効",
    "UV setup required": "UV 設定が必要",
    "UV status unknown": "UV 状態不明",
    "Home Assistant disconnected": "Home Assistant 切断中",
    "Set up device": "デバイスを設定",
    "Select a device or map its state": "デバイスを選択するか状態を割り当ててください",
    "State entity not found": "状態エンティティが見つかりません",
    "Device state unavailable": "デバイス状態を取得不可",
    "Needs attention": "要確認",
    "Controller reports a fault": "コントローラーが異常を報告",
    "Status unknown": "状態不明",
    "Fault status unavailable": "異常状態を取得不可",
    "Standby": "待機",
    "Locked": "ロック中",
    "Starting": "起動中",
    "Pre-rinse": "前洗浄",
    "Post-rinse": "後洗浄",
    "Rinsing": "洗浄中",
    "Not producing": "浄水運転停止中",
    "Open controller for details": "コントローラー画面で詳細を確認",
    "Flow unavailable": "流量を取得不可",
    "Waste total": "累計排水量",
    "Starts": "開始回数",
    "Product TDS": "浄水 TDS",
    "Feed TDS": "原水 TDS",
    "Retry discovery": "再検出",
    "Waiting": "待機中",
    "Last {count} hours": "過去 {count} 時間",
    "Last hour": "過去 1 時間",
    "History ↗": "履歴 ↗",
    "Product TDS history": "浄水 TDS 履歴",
    "Cumulative usage, independent of the chart time range": "累計使用量。グラフの表示期間とは無関係",
    "Usage history": "使用記録",
    "Cumulative": "累計",
    "{name} details, accumulated commanded production time": "{name} の詳細。浄水運転指令の累計時間",
    "Filter care": "フィルター管理",
    "Loading device entities…": "デバイスのエンティティを読み込み中…",
    "Live": "リアルタイム",
    "Latest reading": "最新値",
    "Open details": "詳細を開く",
    "Device data unavailable": "デバイスデータを取得不可",
    "Reminder off": "通知オフ",
    "{name} · Replacement due": "{name}・交換時期",
    "Due: {count}": "交換時期: {count}",
    "Unknown: {count}": "不明: {count}",
    "Review": "確認",
    "Reminders are off": "通知はオフです",
    "{name} · Reminder off": "{name}・通知オフ",
    "Off: {count}": "オフ: {count}",
    "No installed filters in this list": "このリストに設置済みフィルターはありません",
    "No replacement reminders due": "交換通知の対象なし",
    "Plans: {count}": "交換計画: {count}",
    "Filter {count}": "フィルター {count}",
    "Not configured": "未設定",
    "Map product TDS to see water quality.": "水質を表示するには浄水 TDS を割り当ててください。",
    "WATER CIRCUIT": "水路",
    "Tap a component to inspect": "部品をタップして確認",
    "Close component details": "部品の詳細を閉じる",
    "More readings & diagnostics": "その他の測定値と診断",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "表示専用です。水のアニメーションは制御段階を表し、流量や弁の実測状態ではありません。UV 指令は殺菌効果を確認するものではありません。フィルター通知は報告された交換計画の状態で、残寿命の推定値ではありません。水路の段階はカード設定に従います。MQTT はフィルターの種類や配管を報告しません。履歴は Home Assistant Recorder の記録です。",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "カードエディターで WATER デバイスを選ぶか、Home Assistant のエンティティを割り当ててください。",
    "Waiting for Home Assistant": "Home Assistant を待機中",
    "Open device dashboard ↗": "デバイス画面を開く ↗",
    "Controller details ↗": "コントローラーの詳細 ↗",
    "State not mapped": "状態が未割り当て",
    "Device fault · {name}": "デバイス異常・{name}",
    "Controller stopped by a fault. Open state details.": "異常によりコントローラーが停止しました。状態の詳細を確認してください。",
    "Purifying · tap to inspect": "浄水運転中・タップして確認",
    "Flushing · tap to inspect": "洗浄中・タップして確認",
    "Service due": "メンテナンス時期",
    "Service reminders: {count}": "メンテナンス通知: {count}",
    "Review plan status": "交換計画の状態を確認",
    "Filter plans: {count}": "フィルター交換計画: {count}",
    "State unavailable": "状態を取得不可",
    "Updated just now": "たった今更新",
    "Updated {count} min ago": "{count} 分前に更新",
    "Via Home Assistant": "Home Assistant 経由",
    "Waiting for history": "履歴を待機中",
    "Loading history…": "履歴を読み込み中…",
    "No recorded history": "履歴の記録なし",
    "History unavailable": "履歴を取得不可",
    "Live readings remain available.": "リアルタイムの測定値は引き続き利用できます。",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "浄水 TDS の記録。{from} から {to} まで。空白は測定値の欠落を示します。",
    "Recorded history · live reading unavailable": "記録済み履歴・現在の測定値は取得不可",
    "Gaps indicate unavailable readings": "空白は測定値がない区間です",
    "The mapped entity is not present in Home Assistant.": "割り当てたエンティティが Home Assistant にありません。",
    "Assign a verified filter reminder to this stage in the card editor.": "カードエディターで、この段階に確認済みのフィルター交換通知を割り当ててください。",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "個別の状態エンティティが未割り当てです。制御段階だけでは部品の実際の状態を確認できません。",
    "Automatic discovery unavailable. Manual entity mappings still work.": "自動検出を利用できません。エンティティの手動割り当ては利用できます。",
    "{name} mapping mode": "{name} の割り当て方法",
    "From filter list": "フィルターリストから",
    "Automatic": "自動",
    "Choose entity": "エンティティを選択",
    "Hide": "非表示",
    "{name} entity": "{name} のエンティティ",
    "Water quality & production": "水質と浄水運転",
    "Installed equipment & status": "設置機器と状態",
    "Filter reminder entities": "フィルター交換通知エンティティ",
    "Device diagnostics": "デバイス診断",
    "Water Purifier Cards": "浄水器カード",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "WATER MQTT デバイスを選ぶか、エンティティを手動で割り当ててください。3 種類のカードサイズは同じエンティティ設定方式と JavaScript リソースを使用します。",
    "Device": "デバイス",
    "Manual entity mapping": "エンティティの手動割り当て",
    "Saved device · {name}": "保存済みデバイス・{name}",
    "Refresh devices": "デバイスを再読み込み",
    "WATER devices found: {count}": "検出した WATER デバイス: {count}",
    "Title": "タイトル",
    "Card layout": "カードレイアウト",
    "Large · Full water circuit": "大・水路全体",
    "Small · Device status": "小・デバイス状態",
    "Medium · Quality & history": "中・水質と履歴",
    "Device dashboard URL (optional)": "デバイス画面の URL（任意）",
    "Animate water paths (large card)": "水路のアニメーション（大カード）",
    "Show recorded TDS history (medium / large)": "TDS の記録を表示（中・大カード）",
    "TDS history window (hours)": "TDS 履歴の表示期間（時間）",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "小カードは履歴を要求しません。中カードの使用量は累計値で、TDS グラフの表示期間とは無関係です。待機表示は自動運転が有効であることを示しません。",
    "Physical filter → maintenance entity": "実物のフィルター → 管理用エンティティ",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "ファームウェアは 8 つの通知枠に対応しています。設置したフィルターの種類に合わせてください。ここで指定するクリック先は、下の段階設定より優先されます。配管は変更されません。",
    "Filter names & circuit stages": "フィルター名と水路の段階",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "設置したフィルターに名前を付け、実際の段階を指定してください。全項目に段階がある場合は、その種類だけを水路に表示します。それ以外は 5 段階の参考水路を表示します。空のリストは通知だけを非表示にします。",
    "Use a custom list": "カスタムリストを使用",
    "Name": "名前",
    "Entity": "エンティティ",
    "Circuit stage": "水路の段階",
    "Not assigned": "未指定",
    "Remove filter {count}": "フィルター {count} を削除",
    "Add reminder": "通知を追加",
    "Save reminder list": "通知リストを保存",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "未割り当ての任意項目は表示しません。割り当て済みのエンティティが不明または取得不可になっても表示を残します。水路図は大カードのみです。どのカードもデバイスに指令を送りません。",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "sensor、binary_sensor、switch または入力ヘルパーのエンティティを選択してください。",
    "Filter reminder": "フィルター交換通知",
    "Language": "言語",
    "Follow Home Assistant": "Home Assistant に合わせる",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "言語を指定しない場合は Home Assistant のプロフィール設定に従います。独自のタイトルやフィルター名は入力したまま表示します。",
    "Water Purifier · Full": "浄水器・全体",
    "Large card with the water circuit, readings, history and filter care.": "水路、測定値、履歴、フィルター管理を表示する大カード。",
    "Water Purifier · Status": "浄水器・状態",
    "Small home card: operating state, product TDS and flow.": "ホーム用の小カード。運転状態、浄水 TDS、流量を表示。",
    "Water Purifier · History": "浄水器・履歴",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "中カード。水質、TDS の記録、累計使用量、フィルター交換通知を表示。"
  },
  "ko": {
    "Water purifier": "정수기",
    "Control state": "제어 상태",
    "Fault": "고장",
    "Feed water": "원수",
    "Product water": "정수",
    "Feed temperature": "원수 온도",
    "Product temperature": "정수 온도",
    "Product flow": "정수 유량",
    "Concentrate flow": "농축수 유량",
    "Product total": "누적 정수량",
    "Concentrate total": "누적 농축수량",
    "RO recovery": "RO 회수율",
    "Production time": "누적 정수 가동 시간",
    "Uptime": "가동 시간",
    "Output capability": "출력 허용 상태",
    "Pump voltage · uncalibrated": "펌프 전압 · 미교정",
    "Pump current · uncalibrated": "펌프 전류 · 미교정",
    "UVC voltage · uncalibrated": "UVC 전압 · 미교정",
    "UVC current · uncalibrated": "UVC 전류 · 미교정",
    "Production starts": "정수 가동 시작 횟수",
    "Fault count": "고장 횟수",
    "Filter {count} reminder": "필터 {count} 알림",
    "Booster pump": "가압 펌프",
    "Inlet valve": "급수 밸브",
    "Flush valve": "세척 밸브",
    "UV output command": "UV 출력 명령",
    "UV installed and enabled": "UV 설치 및 활성화",
    "UV controller status": "UV 제어기 상태",
    "Pressure": "압력",
    "Leak detector": "누수 센서",
    "Sediment prefilter": "전처리 침전물 필터",
    "Granular carbon prefilter": "전처리 입상 활성탄 필터",
    "Carbon block prefilter": "전처리 카본 블록 필터",
    "Reverse osmosis membrane": "역삼투압 멤브레인",
    "Post carbon filter": "후처리 활성탄 필터",
    "Installation required": "설치 설정 필요",
    "Idle": "대기",
    "Opening inlet": "급수 밸브 여는 중",
    "Preflushing": "사전 세척 중",
    "Purifying": "정수 중",
    "Postflushing": "후세척 중",
    "Maintenance": "유지보수 중",
    "Flushing": "세척 중",
    "Output test": "출력 테스트",
    "No fault": "고장 없음",
    "Disabled": "비활성화됨",
    "Replacement not recorded": "교체 기록 없음",
    "Replacement due": "교체 시기 도래",
    "Date unknown": "날짜 알 수 없음",
    "In service": "사용 중",
    "Not fitted": "미설치",
    "Commanded on": "켜짐 명령",
    "Enabled": "활성화됨",
    "Controller outputs permitted": "제어기 출력 허용됨",
    "Outputs locked": "출력 잠김",
    "Configuration fault": "설정 오류",
    "Clock fault": "시계 오류",
    "Control deadline missed": "제어 처리 기한 초과",
    "Invalid input": "입력 무효",
    "Stale input": "입력 데이터 오래됨",
    "No water supply": "급수 없음",
    "Protection input active": "보호 입력 작동",
    "Cycle time exceeded": "운전 주기 시간 초과",
    "On": "켜짐",
    "Off": "꺼짐",
    "UV current below limit": "UV 전류 하한 미만",
    "UV current above limit": "UV 전류 상한 초과",
    "Unexpected current while UV is off": "UV 꺼짐 상태에서 비정상 전류",
    "UV electrical feedback unavailable": "UV 전기 측정값 사용 불가",
    "UV configuration required": "UV 설정 필요",
    "UV feedback unavailable": "UV 피드백 사용 불가",
    "{name} must be a mapping.": "{name}은(는) 매핑이어야 합니다.",
    "Unknown {name} key: {key}": "{name}의 알 수 없는 키: {key}",
    "{name}.{key}: select an entity ID, or null to hide it.": "{name}.{key}: 엔터티 ID를 선택하거나 숨기려면 null을 지정하세요.",
    "Card configuration must be an object.": "카드 설정은 객체여야 합니다.",
    "Choose a Water Purifier full, status or history card type.": "정수기 전체, 상태 또는 이력 카드 유형을 선택하세요.",
    "Title must be at most 100 characters.": "제목은 100자 이하여야 합니다.",
    "Layout must be full, small or medium.": "layout은 full, small 또는 medium이어야 합니다.",
    "{name} must be true or false.": "{name}은(는) true 또는 false여야 합니다.",
    "history_hours must be an integer from 1 to 24.": "history_hours는 1~24 사이의 정수여야 합니다.",
    "dashboard_url must be an http:// or https:// URL without credentials.": "dashboard_url은 인증 정보가 없는 http:// 또는 https:// URL이어야 합니다.",
    "device_id must be a Home Assistant device registry ID.": "device_id는 Home Assistant 장치 레지스트리 ID여야 합니다.",
    "filters must be an array with at most eight entries.": "filters는 최대 8개 항목의 배열이어야 합니다.",
    "Filter {count} needs a name (1–60 characters) and an entity ID.": "필터 {count}에 이름(1~60자)과 엔터티 ID가 필요합니다.",
    "Filter stage must be pp, udf, cto, ro, or post.": "필터 단계는 pp, udf, cto, ro 또는 post여야 합니다.",
    "Choose a supported language, or auto to follow Home Assistant.": "지원되는 언어를 선택하거나 Home Assistant를 따르려면 auto를 지정하세요.",
    "Not mapped": "매핑 안 됨",
    "HA disconnected": "HA 연결 끊김",
    "Entity not found": "엔터티를 찾을 수 없음",
    "Unavailable": "사용 불가",
    "Unknown": "알 수 없음",
    "Device discovery is unavailable. Map entities manually.": "장치 검색을 사용할 수 없습니다. 엔터티를 수동으로 매핑하세요.",
    "Unexpected registry response. Map entities manually.": "레지스트리 응답이 올바르지 않습니다. 엔터티를 수동으로 매핑하세요.",
    "Selected device has no unique WATER MQTT identifier. Map entities manually.": "선택한 장치에 고유한 WATER MQTT 식별자가 없습니다. 엔터티를 수동으로 매핑하세요.",
    "Could not discover entities. Use manual mappings.": "엔터티를 검색할 수 없습니다. 수동 매핑을 사용하세요.",
    "PP sediment filter": "PP 침전물 필터",
    "UDF granular carbon filter": "UDF 입상 활성탄 필터",
    "CTO carbon block filter": "CTO 카본 블록 필터",
    "RO membrane": "RO 멤브레인",
    "T33 post carbon filter": "T33 후처리 활성탄 필터",
    "Waste valve": "배수 밸브",
    "UV lamp": "UV 램프",
    "Concentrate": "농축수",
    "{name} details": "{name} 상세 정보",
    "Inlet": "급수",
    "Pump": "펌프",
    "Feed": "원수",
    "Product": "정수",
    "Water circuit diagram": "수로도",
    "Water circuit": "수로",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.": "수로: 원수는 설정된 전처리 필터, 급수 밸브와 펌프를 거쳐 멤브레인의 분기점에 도달합니다. 정수는 설정된 후처리 필터를 통과하고 농축수는 배수 분기로 배출됩니다.",
    "Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.": "수로: 원수는 설정된 전처리 필터, 급수 밸브와 펌프를 거쳐 멤브레인의 분기점에 도달합니다. 정수는 설정된 후처리 필터와 UV 램프를 통과하고 농축수는 배수 분기로 배출됩니다.",
    "Total produced": "누적 생산량",
    "Temperature": "온도",
    "UV fault": "UV 고장",
    "UV commanded on": "UV 켜짐 명령",
    "UV commanded off": "UV 꺼짐 명령",
    "UV disabled": "UV 비활성화됨",
    "UV setup required": "UV 설정 필요",
    "UV status unknown": "UV 상태 알 수 없음",
    "Home Assistant disconnected": "Home Assistant 연결 끊김",
    "Set up device": "장치 설정",
    "Select a device or map its state": "장치를 선택하거나 상태를 매핑하세요",
    "State entity not found": "상태 엔터티를 찾을 수 없음",
    "Device state unavailable": "장치 상태 사용 불가",
    "Needs attention": "확인 필요",
    "Controller reports a fault": "제어기에서 고장 보고",
    "Status unknown": "상태 알 수 없음",
    "Fault status unavailable": "고장 상태 사용 불가",
    "Standby": "대기",
    "Locked": "잠김",
    "Starting": "시작 중",
    "Pre-rinse": "사전 세척",
    "Post-rinse": "후세척",
    "Rinsing": "세척 중",
    "Not producing": "정수 가동 중 아님",
    "Open controller for details": "제어기 화면에서 상세 정보 확인",
    "Flow unavailable": "유량 사용 불가",
    "Waste total": "누적 배수량",
    "Starts": "시작 횟수",
    "Product TDS": "정수 TDS",
    "Feed TDS": "원수 TDS",
    "Retry discovery": "다시 검색",
    "Waiting": "대기 중",
    "Last {count} hours": "최근 {count}시간",
    "Last hour": "최근 1시간",
    "History ↗": "이력 ↗",
    "Product TDS history": "정수 TDS 이력",
    "Cumulative usage, independent of the chart time range": "차트의 시간 범위와 무관한 누적 사용량",
    "Usage history": "사용 이력",
    "Cumulative": "누적",
    "{name} details, accumulated commanded production time": "{name} 상세 정보, 정수 가동 명령의 누적 시간",
    "Filter care": "필터 관리",
    "Loading device entities…": "장치 엔터티 불러오는 중…",
    "Live": "실시간",
    "Latest reading": "최신 측정값",
    "Open details": "상세 정보 열기",
    "Device data unavailable": "장치 데이터 사용 불가",
    "Reminder off": "알림 꺼짐",
    "{name} · Replacement due": "{name} · 교체 시기 도래",
    "Due: {count}": "교체 시기 도래: {count}",
    "Unknown: {count}": "알 수 없음: {count}",
    "Review": "확인",
    "Reminders are off": "알림이 꺼져 있음",
    "{name} · Reminder off": "{name} · 알림 꺼짐",
    "Off: {count}": "꺼짐: {count}",
    "No installed filters in this list": "이 목록에 설치된 필터가 없음",
    "No replacement reminders due": "교체 시기가 도래한 알림 없음",
    "Plans: {count}": "계획: {count}",
    "Filter {count}": "필터 {count}",
    "Not configured": "미설정",
    "Map product TDS to see water quality.": "수질을 보려면 정수 TDS를 매핑하세요.",
    "WATER CIRCUIT": "수로",
    "Tap a component to inspect": "부품을 눌러 확인",
    "Close component details": "부품 상세 정보 닫기",
    "More readings & diagnostics": "추가 측정값 및 진단",
    "Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.": "읽기 전용입니다. 물 흐름 애니메이션은 제어 단계에 따라 표시되며 유량이나 밸브의 실제 피드백이 아닙니다. UV 명령으로 살균 효과를 확인할 수는 없습니다. 필터 알림은 보고된 계획 상태이며 잔여 수명 추정치가 아닙니다. 수로 단계는 카드 설정을 따릅니다. MQTT는 필터 종류나 배관 정보를 보고하지 않습니다. 이력은 Home Assistant Recorder에서 가져옵니다.",
    "Choose your WATER device in the card editor, or map Home Assistant entities.": "카드 편집기에서 WATER 장치를 선택하거나 Home Assistant 엔터티를 매핑하세요.",
    "Waiting for Home Assistant": "Home Assistant 대기 중",
    "Open device dashboard ↗": "장치 대시보드 열기 ↗",
    "Controller details ↗": "제어기 상세 정보 ↗",
    "State not mapped": "상태 매핑 안 됨",
    "Device fault · {name}": "장치 고장 · {name}",
    "Controller stopped by a fault. Open state details.": "고장으로 제어기가 정지했습니다. 상태 상세 정보를 확인하세요.",
    "Purifying · tap to inspect": "정수 중 · 눌러서 확인",
    "Flushing · tap to inspect": "세척 중 · 눌러서 확인",
    "Service due": "관리 시기 도래",
    "Service reminders: {count}": "관리 알림: {count}",
    "Review plan status": "계획 상태 확인",
    "Filter plans: {count}": "필터 계획: {count}",
    "State unavailable": "상태 사용 불가",
    "Updated just now": "방금 업데이트됨",
    "Updated {count} min ago": "{count}분 전에 업데이트됨",
    "Via Home Assistant": "Home Assistant 경유",
    "Waiting for history": "이력 대기 중",
    "Loading history…": "이력 불러오는 중…",
    "No recorded history": "기록된 이력 없음",
    "History unavailable": "이력 사용 불가",
    "Live readings remain available.": "실시간 측정값은 계속 사용할 수 있습니다.",
    "Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.": "기록된 정수 TDS 추이. {from}부터 {to}까지. 빈 구간은 측정값 누락을 나타냅니다.",
    "Recorded history · live reading unavailable": "기록된 이력 · 실시간 측정값 사용 불가",
    "Gaps indicate unavailable readings": "빈 구간은 측정값을 사용할 수 없는 기간입니다",
    "The mapped entity is not present in Home Assistant.": "매핑된 엔터티가 Home Assistant에 없습니다.",
    "Assign a verified filter reminder to this stage in the card editor.": "카드 편집기에서 이 단계에 확인된 필터 알림을 지정하세요.",
    "No individual status entity is mapped. Controller phase does not prove the physical component state.": "개별 상태 엔터티가 매핑되지 않았습니다. 제어 단계만으로 부품의 실제 상태를 확인할 수 없습니다.",
    "Automatic discovery unavailable. Manual entity mappings still work.": "자동 검색을 사용할 수 없습니다. 수동 엔터티 매핑은 계속 사용할 수 있습니다.",
    "{name} mapping mode": "{name} 매핑 방식",
    "From filter list": "필터 목록에서",
    "Automatic": "자동",
    "Choose entity": "엔터티 선택",
    "Hide": "숨기기",
    "{name} entity": "{name} 엔터티",
    "Water quality & production": "수질 및 정수 가동",
    "Installed equipment & status": "설치 장비 및 상태",
    "Filter reminder entities": "필터 알림 엔터티",
    "Device diagnostics": "장치 진단",
    "Water Purifier Cards": "정수기 카드",
    "Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.": "WATER MQTT 장치를 선택하거나 엔터티를 수동으로 매핑하세요. 세 가지 카드 크기는 동일한 엔터티 설정 방식과 JavaScript 리소스를 사용합니다.",
    "Device": "장치",
    "Manual entity mapping": "수동 엔터티 매핑",
    "Saved device · {name}": "저장된 장치 · {name}",
    "Refresh devices": "장치 새로고침",
    "WATER devices found: {count}": "검색된 WATER 장치: {count}",
    "Title": "제목",
    "Card layout": "카드 레이아웃",
    "Large · Full water circuit": "대형 · 전체 수로",
    "Small · Device status": "소형 · 장치 상태",
    "Medium · Quality & history": "중형 · 수질 및 이력",
    "Device dashboard URL (optional)": "장치 대시보드 URL(선택 사항)",
    "Animate water paths (large card)": "물 흐름 애니메이션(대형 카드)",
    "Show recorded TDS history (medium / large)": "TDS 기록 표시(중형/대형)",
    "TDS history window (hours)": "TDS 이력 기간(시간)",
    "The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.": "소형 카드는 이력을 요청하지 않습니다. 중형 카드의 사용량은 누적값이며 TDS 차트의 시간 범위와 무관합니다. 대기 상태가 자동 운전 활성화를 의미하지는 않습니다.",
    "Physical filter → maintenance entity": "실제 필터 → 관리 엔터티",
    "The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.": "펌웨어는 8개의 알림 슬롯을 지원합니다. 설치된 필터 종류에 맞게 연결하세요. 여기서 명시한 클릭 대상 매핑은 아래 단계 지정에 우선하며, 실제 배관을 변경하지 않습니다.",
    "Filter names & circuit stages": "필터 이름 및 수로 단계",
    "Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.": "설치된 필터의 이름과 실제 단계를 지정하세요. 모든 항목에 단계가 지정되면 해당 단계 종류만 수로에 표시됩니다. 그렇지 않으면 5단계 참고 수로를 유지합니다. 빈 목록은 알림만 숨깁니다.",
    "Use a custom list": "사용자 지정 목록 사용",
    "Name": "이름",
    "Entity": "엔터티",
    "Circuit stage": "수로 단계",
    "Not assigned": "미지정",
    "Remove filter {count}": "필터 {count} 제거",
    "Add reminder": "알림 추가",
    "Save reminder list": "알림 목록 저장",
    "Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.": "매핑되지 않은 선택 항목은 표시하지 않습니다. 매핑된 엔터티가 알 수 없음 또는 사용 불가 상태가 되어도 계속 표시합니다. 수로도는 대형 카드에만 포함됩니다. 어떤 카드도 장치 명령을 보내지 않습니다.",
    "Choose a sensor, binary_sensor, switch or input helper entity.": "sensor, binary_sensor, switch 또는 입력 도우미 엔터티를 선택하세요.",
    "Filter reminder": "필터 알림",
    "Language": "언어",
    "Follow Home Assistant": "Home Assistant 따르기",
    "Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.": "언어를 직접 선택하지 않으면 Home Assistant 프로필 설정을 따릅니다. 사용자 지정 제목과 필터 이름은 입력한 그대로 유지됩니다.",
    "Water Purifier · Full": "정수기 · 전체",
    "Large card with the water circuit, readings, history and filter care.": "수로, 측정값, 이력 및 필터 관리를 표시하는 대형 카드입니다.",
    "Water Purifier · Status": "정수기 · 상태",
    "Small home card: operating state, product TDS and flow.": "홈용 소형 카드: 가동 상태, 정수 TDS 및 유량을 표시합니다.",
    "Water Purifier · History": "정수기 · 이력",
    "Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.": "중형 카드: 수질, 기록된 TDS 추이, 누적 사용량 및 필터 알림을 표시합니다."
  }
};
  // Dictionaries are embedded so HACS installs one self-contained resource.
  // English messages are stable keys; interpolation never changes entity identifiers.
  const LANGUAGE_NAMES = {en:'English','zh-Hans':'简体中文','zh-Hant':'繁體中文',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano',nl:'Nederlands','pt-BR':'Português (Brasil)',ja:'日本語',ko:'한국어'};
  function supportedLanguage(value) {
    if(typeof value!=='string')return null;
    const code=value.trim().replace(/_/g,'-').toLowerCase();
    if(code==='auto')return 'auto';
    if(!/^[a-z]{2}(?:-[a-z]{4})?(?:-(?:[a-z]{2}|[0-9]{3}))?$/.test(code))return null;
    if(code==='zh'||/^zh-(hans|cn|sg)(-|$)/.test(code))return 'zh-Hans';
    if(/^zh-(hant|tw|hk|mo)(-|$)/.test(code))return 'zh-Hant';
    if(/^pt(-|$)/.test(code))return 'pt-BR';
    const base=code.split('-')[0];
    return ['en','de','fr','es','it','nl','ja','ko'].includes(base)?base:null;
  }
  function createI18n(config={},hass) {
    const browser=globalThis.navigator?.language||'en';
    const haLanguage=hass?.locale?.language||hass?.language||browser;
    const requested=supportedLanguage(config.language??'auto')??'auto';
    const language=supportedLanguage(requested==='auto'?haLanguage:requested)||'en';
    const selected=language==='auto'?'en':language;
    const t=(key,values={})=>String(has(LOCALES,selected)&&has(LOCALES[selected],key)?LOCALES[selected][key]:has(LOCALES.en,key)?LOCALES.en[key]:key).replace(/\{(\w+)\}/g,(match,name)=>has(values,name)?String(values[name]):match);
    const numberFormat=hass?.locale?.number_format??'language';
    const systemLocale=globalThis.navigator?.languages?.length?globalThis.navigator.languages:browser;
    const numberLocales={comma_decimal:'en-US',decimal_comma:'de',space_comma:'fr',quote_decimal:'de-CH',none:'en-US'};
    const numberLocale=has(numberLocales,numberFormat)?numberLocales[numberFormat]:numberFormat==='system'?systemLocale:haLanguage;
    const numbers=new Map();
    const number=(value,digits=Math.abs(value)<10?2:1)=>{
      if(!numbers.has(digits)){
        const options={maximumFractionDigits:digits,useGrouping:numberFormat!=='none'};
        try{numbers.set(digits,new Intl.NumberFormat(numberLocale,options));}catch{numbers.set(digits,new Intl.NumberFormat('en',options));}
      }
      return numbers.get(digits).format(value);
    };
    const timeFormat=hass?.locale?.time_format??'language';
    const timeOptions={hour:'2-digit',minute:'2-digit'};
    if(timeFormat==='12'||timeFormat==='24')timeOptions.hourCycle=timeFormat==='12'?'h12':'h23';
    if(hass?.locale?.time_zone!=='local'&&hass?.config?.time_zone)timeOptions.timeZone=hass.config.time_zone;
    let time;
    try{time=new Intl.DateTimeFormat(timeFormat==='system'?systemLocale:haLanguage,timeOptions);}
    catch{time=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',...(timeFormat==='12'||timeFormat==='24'?{hourCycle:timeFormat==='12'?'h12':'h23'}:{})});}
    return {language:selected,t,html:(key,values)=>esc(t(key,values)),number,clock:timestamp=>time.format(new Date(timestamp))};
  }
  function refreshI18n(host) {
    const h=host._hass,l=h?.locale;
    const signature=JSON.stringify([host._config?.language??'auto',l?.language,h?.language,l?.number_format,l?.time_format,l?.time_zone,h?.config?.time_zone,globalThis.navigator?.language]);
    if(host._localeSignature===signature)return false;
    host._localeSignature=signature;host._i18n=createI18n(host._config??{},h);
    host.setAttribute('lang',host._i18n.language);
    return true;
  }
  class CardMessageError extends Error {
    constructor(key,values={},i18n){super(i18n?i18n.t(key,values):key);this.key=key;this.values=values;}
  }
  function errorMessage(error,i18n){return error?.key?i18n.t(error.key,error.values):typeof error==='string'?error:error?.message||'';}
  function fieldLabel(field,i18n){const match=/^filter_(\d+)$/.exec(field.key);return match?i18n.t('Filter {count} reminder',{count:i18n.number(Number(match[1]),0)}):i18n.t(field.label);}

  function dashboardUrl(value) {
    if (!value) return '';
    try {const url = new URL(value);return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';} catch {return '';}
  }
  function validateMap(value, allowed, name, i18n) {
    if (value === undefined) return {};
    if (!record(value)) throw new CardMessageError('{name} must be a mapping.',{name},i18n);
    const result = {};
    for (const [key, id] of Object.entries(value)) {
      if (!has(allowed, key)) throw new CardMessageError('Unknown {name} key: {key}',{name,key},i18n);
      if (id !== null && !entityId(id)) throw new CardMessageError('{name}.{key}: select an entity ID, or null to hide it.',{name,key},i18n);
      result[key] = id;
    }
    return result;
  }
  function normalize(config,hass) {
    const i18n=createI18n(record(config)?config:{},hass);
    const fail=(key,values)=>{throw new CardMessageError(key,values,i18n);};
    if (!record(config)) fail('Card configuration must be an object.');
    const type = config.type ?? 'custom:' + TAG;
    const typeTag = typeof type === 'string' && type.startsWith('custom:') ? type.slice(7) : '';
    const defaultLayout = has(CARD_LAYOUTS, typeTag) ? CARD_LAYOUTS[typeTag] : null;
    if (!defaultLayout) fail('Choose a Water Purifier full, status or history card type.');
    if (config.language!==undefined&&!supportedLanguage(config.language)) fail('Choose a supported language, or auto to follow Home Assistant.');
    if (config.title !== undefined && (typeof config.title !== 'string' || config.title.length > 100)) fail('Title must be at most 100 characters.');
    if (config.layout !== undefined && !['full', 'small', 'medium', 'compact'].includes(config.layout)) fail('Layout must be full, small or medium.');
    const layout = config.layout === 'compact' ? 'small' : config.layout ?? defaultLayout;
    if (config.animate !== undefined && typeof config.animate !== 'boolean') fail('{name} must be true or false.',{name:'animate'});
    if (config.show_history !== undefined && typeof config.show_history !== 'boolean') fail('{name} must be true or false.',{name:'show_history'});
    if (config.history_hours !== undefined && (!Number.isInteger(config.history_hours) || config.history_hours < 1 || config.history_hours > 24)) fail('history_hours must be an integer from 1 to 24.');
    if (config.dashboard_url !== undefined && (typeof config.dashboard_url !== 'string' || config.dashboard_url && !dashboardUrl(config.dashboard_url))) fail('dashboard_url must be an http:// or https:// URL without credentials.');
    if (config.device_id !== undefined && (typeof config.device_id !== 'string' || !config.device_id.trim())) fail('device_id must be a Home Assistant device registry ID.');
    let filters;
    if (config.filters !== undefined) {
      if (!Array.isArray(config.filters) || config.filters.length > 8) fail('filters must be an array with at most eight entries.');
      filters = config.filters.map((f, i) => {
        if (!record(f) || !entityId(f.entity) || typeof f.name !== 'string' || !f.name.trim() || f.name.length > 60) fail('Filter {count} needs a name (1–60 characters) and an entity ID.',{count:i18n.number(i+1,0)});
        if (f.stage !== undefined && !has(STAGES, f.stage)) fail('Filter stage must be pp, udf, cto, ro, or post.');
        return {name: f.name, entity: f.entity, ...(f.stage ? {stage:f.stage} : {})};
      });
    }
    return {...config, type, language:supportedLanguage(config.language??'auto'), layout,
      animate: config.animate ?? true, show_history: config.show_history ?? true, history_hours: config.history_hours ?? (layout === 'medium' ? 6 : 1),
      entities: validateMap(config.entities, FIELD, 'entities',i18n),
      stages: validateMap(config.stages, STAGES, 'stages',i18n), ...(filters === undefined ? {} : {filters})};
  }
  function sample(hass, id, kind = 'text', i18n=createI18n({},hass)) {
    const t=i18n.t;
    if (!id) return {status: 'unbound', text: t('Not mapped')};
    if (!hass || hass.connected === false || hass.connection?.connected === false) return {status: 'unavailable', text: t('HA disconnected')};
    const obj = hass.states?.[id];
    if (!obj) return {status: 'missing', text: t('Entity not found')};
    const raw = String(obj.state ?? '').trim();
    const value = raw.toLowerCase();
    if (value === 'unavailable') return {status: 'unavailable', text: t('Unavailable'), obj};
    if (!value || ['unknown', 'null', 'undefined', 'nan'].includes(value) || kind === 'number' && value === 'none') return {status: 'unknown', text: t('Unknown'), obj};
    if (kind === 'number') {
      const number = Number(raw);
      if (!Number.isFinite(number)) return {status: 'unknown', text: t('Unknown'), obj};
      return {status: 'valid', number, raw, obj, text: i18n.number(number)};
    }
    return {status: 'valid', raw, obj, text: has(TEXT,value)?t(TEXT[value]):raw};
  }
  const registryCache = new WeakMap();
  async function registries(hass, refresh = false) {
    const connection = hass.connection;
    if (!connection || typeof hass.callWS !== 'function') throw new CardMessageError('Device discovery is unavailable. Map entities manually.');
    if (refresh) registryCache.delete(connection);
    if (!registryCache.has(connection)) {
      const promise = Promise.all([
        hass.callWS({type: 'config/device_registry/list'}),
        hass.callWS({type: 'config/entity_registry/list'})
      ]).then(([devices, entities]) => {
        if (!Array.isArray(devices) || !Array.isArray(entities)) throw new CardMessageError('Unexpected registry response. Map entities manually.');
        return {devices, entities};
      });
      registryCache.set(connection, promise);
      promise.catch(() => {if (registryCache.get(connection) === promise) registryCache.delete(connection);});
    }
    return registryCache.get(connection);
  }
  function waterIdentifier(device) {
    const matches = (device?.identifiers ?? []).filter(p => Array.isArray(p) && p[0] === 'mqtt' && /^water_[0-9a-f]{12}$/.test(p[1]));
    return matches.length === 1 ? matches[0][1] : null;
  }
  function mappingFor(registry, deviceId) {
    const device = registry.devices.find(d => d.id === deviceId);
    const identifier = waterIdentifier(device);
    if (!identifier) throw new CardMessageError('Selected device has no unique WATER MQTT identifier. Map entities manually.');
    const map = {};
    for (const f of FIELDS.filter(f => f.suffix)) {
      const matches = registry.entities.filter(e => e.device_id === deviceId && e.platform === 'mqtt' && !e.disabled_by &&
        e.entity_id?.startsWith('sensor.') && e.unique_id === identifier + '_' + f.suffix);
      if (matches.length === 1) map[f.key] = matches[0].entity_id;
    }
    return map;
  }
  // Precision circuit artwork. No external assets, fonts, SVG IDs, or runtime dependencies.
  // Options are presentation-only: never derive valve commands from these paths.
  function circuitEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function circuitPart(key, x, y, artwork, label, bounds = [-30, -34, 60, 90], labelY = 62, i18n=createI18n()) {
    const names = {pp:'PP sediment filter',udf:'UDF granular carbon filter',cto:'CTO carbon block filter',ro:'RO membrane',post:'T33 post carbon filter',inlet:'Inlet valve',pump:'Booster pump',flush:'Waste valve',uv:'UV lamp',feed:'Feed water',product:'Product water',waste:'Concentrate'};
    return `<g class="part part-${key}" data-part="${key}" role="button" tabindex="0" aria-label="${circuitEscape(i18n.t('{name} details',{name:i18n.t(has(names,key)?names[key]:'Water circuit')}))}" transform="translate(${x} ${y})"><rect class="part-hit" x="${bounds[0]}" y="${bounds[1]}" width="${bounds[2]}" height="${bounds[3]}" rx="5" fill="transparent"/>${artwork}${label ? `<text class="node-label" y="${labelY}">${circuitEscape(i18n.t(label))}</text>` : ''}</g>`;
  }
  function circuitPrefilter(key, x, y, narrow, i18n) {
    const top = narrow ? -26 : -40, bottom = narrow ? 29 : 47, capY = top - 7;
    let detail = '';
    if (key === 'pp') {
      for (let xx = -12; xx <= 12; xx += 6) detail += `<path class="medium-detail" d="M${xx} ${top+6}V${bottom-6}"/>`;
    } else if (key === 'udf') {
      for (let yy = top+8; yy < bottom-3; yy += 9) {
        for (let xx = -10; xx <= 10; xx += 10) detail += `<circle class="medium-grain" cx="${xx+(Math.round((yy-top-8)/9)%2 ? 2 : 0)}" cy="${yy}" r="1"/>`;
      }
    } else {
      for (let yy = top+5; yy < bottom-7; yy += 12) detail += `<path class="medium-detail" d="M-13 ${yy}l26 10m-26 0 26-10"/>`;
    }
    const art = `<rect class="body" x="-19" y="${top}" width="38" height="${bottom-top}" rx="5"/>${detail}<path class="detail" d="M-18 ${bottom-5}h36"/><rect class="cap" x="-22" y="${capY}" width="44" height="11" rx="2"/><path class="body" d="M-16 ${capY}v-4q0-3 4-3h24q4 0 4 3v4Z"/><path class="detail" d="M-10 ${capY-8}v-3h20v3"/>`;
    const label = {pp:'01 PP',udf:'02 UDF',cto:'03 CTO'}[key];
    return circuitPart(key,x,y,art,label,[-31,capY-16,62,bottom-capY+47],narrow ? 52 : 75,i18n);
  }
  function circuitValve(key, x, y, labelY, i18n) {
    const art = `<path class="body" d="M-23-7h12v-3h22v3h12V7H11v3h-22V7h-12Z"/><path class="detail" d="M-16-7V7M16-7V7M-7-10v-10H7v10"/><rect class="body" x="-13" y="-34" width="26" height="16" rx="2"/><path class="detail" d="M-13-27h26m-20-7v-4H7v4"/>`;
    return circuitPart(key,x,y,art,key==='inlet'?'Inlet':'Waste valve',[-31,-40,62,labelY+54],labelY,i18n);
  }
  function circuitPump(x, y, labelY, i18n) {
    const art = `<rect class="body" x="-38" y="-14" width="14" height="28" rx="6"/><rect class="body" x="-27" y="-22" width="48" height="44" rx="7"/><path class="detail" d="M-21-13H9m-30 9H9m-30 9H9m-30 9H9"/><rect class="cap" x="13" y="-24" width="10" height="48" rx="2"/><path class="body" d="M23-19h8q7 0 7 8v22q0 8-7 8h-8Z"/><path class="detail" d="M-42-5h4m76 0h4"/>`;
    return circuitPart('pump',x,y,art,'Pump',[-47,-33,94,labelY+47],labelY,i18n);
  }
  function circuitMembrane(x,y,narrow,labelY,i18n) {
    const half = narrow ? 49 : 67, inner = half-15;
    let detail = '';
    for (let yy=-13;yy<=13;yy+=6.5) detail += `<path class="membrane-detail" d="M${-inner} ${yy}H${inner}"/>`;
    const art = `<rect class="body" x="${-half}" y="-21" width="${half*2}" height="42" rx="12"/><rect class="membrane-fill" x="${-inner}" y="-19" width="${inner*2}" height="38"/>${detail}<rect class="cap" x="${-half+7}" y="-25" width="9" height="50" rx="2"/><rect class="cap" x="${half-16}" y="-25" width="9" height="50" rx="2"/><path class="detail" d="M${-half-5}-6h5m${half*2} 0h5"/>`;
    return circuitPart('ro',x,y,art,'04 RO',[-half-8,-35,half*2+16,labelY+49],labelY,i18n);
  }
  function circuitFinisher(key,x,y,narrow,labelY,i18n) {
    const half = narrow ? 22 : 36, inner = half-8;
    let detail = '';
    if (key==='post') {
      for(let yy=-8;yy<=8;yy+=8) for(let xx=-inner+5;xx<=inner-3;xx+=8) detail += `<circle class="medium-grain" cx="${xx}" cy="${yy}" r=".9"/>`;
    } else detail = `<rect class="membrane-fill" x="${-inner+3}" y="-4" width="${inner*2-6}" height="8" rx="4"/><path class="membrane-detail" d="M${-inner+4} 0H${inner-4}"/>`;
    const art = `<rect class="body" x="${-half}" y="-15" width="${half*2}" height="30" rx="6"/>${detail}<path class="detail" d="M${-half+7}-15v30m${half*2-14}-30v30"/><path class="body" d="M${-half}-6h-5V6h5m${half*2}-12h5V6h-5"/>`;
    return circuitPart(key,x,y,art,key==='post'?'05 T33':'UV',[-half-6,-25,half*2+12,labelY+40],labelY,i18n);
  }
  function circuitEndpoint(key,x,y,label,value='',anchor='middle',i18n=createI18n()) {
    const unit = key==='product'?'product':'waste';
    const text = `<text class="node-label endpoint-label" y="0" style="text-anchor:${anchor}">${circuitEscape(i18n.t(label))}</text>${key==='feed'?'':`<text class="sub endpoint-flow" data-circuit-flow="${unit}" y="20" style="text-anchor:${anchor}">${circuitEscape(value)}</text>`}`;
    const width = key==='feed'?54:100, left = anchor==='end'?-width:anchor==='start'?0:-width/2;
    return circuitPart(key,x,y,text,'',[left,-28,width,54],62,i18n);
  }
  function diagramSvg(narrow, options={}) {
    const i18n=options.i18n??createI18n();
    const stages = new Set(Array.isArray(options.activeStages) ? options.activeStages.filter(key=>['pp','udf','cto','ro','post'].includes(key)) : ['pp','udf','cto','ro','post']);
    const pre = ['pp','udf','cto'].filter(key=>stages.has(key));
    const showUV = options.showUV===true, finish = [...(stages.has('post')?['post']:[]),...(showUV?['uv']:[])];
    const width=narrow?360:1000,height=narrow?476:246;
    let main='',product='',waste='',parts='';
    if (!narrow) {
      const y=122,upper=68,lower=176;
      const mainItems=[...pre.map(key=>({key,width:50})),{key:'inlet',width:56},{key:'pump',width:84},...(stages.has('ro')?[{key:'ro',width:144}]:[])];
      const total=mainItems.reduce((sum,item)=>sum+item.width,0),gap=Math.min(46,(570-total)/Math.max(1,mainItems.length-1));
      let cursor=80+(570-total-gap*(mainItems.length-1))/2;
      for(const item of mainItems){
        const x=cursor+item.width/2;
        if(pre.includes(item.key))parts+=circuitPrefilter(item.key,x,y,false,i18n);
        else if(item.key==='inlet')parts+=circuitValve('inlet',x,y,75,i18n);
        else if(item.key==='pump')parts+=circuitPump(x,y,75,i18n);
        else parts+=circuitMembrane(x,y,false,75,i18n);
        cursor+=item.width+gap;
      }
      main=`M54 ${y}H646`;
      product=`M646 ${y}h3q17 0 17-17V${upper+17}q0-17 17-17H907`;
      waste=`M646 ${y}h3q17 0 17 17V${lower-17}q0 17 17 17H907`;
      const positions=finish.length===2?[752,852]:[801];
      finish.forEach((key,index)=>{parts+=circuitFinisher(key,positions[index],upper,false,40,i18n);});
      parts+=circuitValve('flush',802,lower,43,i18n);
      parts+=circuitEndpoint('feed',26,126,'Feed','','middle',i18n);
      parts+=circuitEndpoint('product',990,upper-1,'Product',options.productFlow??'—','end',i18n);
      parts+=circuitEndpoint('waste',990,lower-1,'Concentrate',options.wasteFlow??'—','end',i18n);
    } else {
      // Three readable equipment rows replace the single desktop line; topology is unchanged.
      const top=60,second=156,center=294,upper=222,lower=366;
      const preXs=pre.length===3?[82,180,278]:pre.length===2?[116,246]:[180];
      pre.forEach((key,index)=>{parts+=circuitPrefilter(key,preXs[index],top,true,i18n);});
      main=`M22 ${top}H316q16 0 16 16V${second-16}q0 16-16 16H44q-16 0-16 16V${center-16}q0 16 16 16H178`;
      product=`M178 ${center}h2q16 0 16-16V${upper+16}q0-16 16-16H346`;
      waste=`M178 ${center}h2q16 0 16 16V${lower-16}q0 16 16 16H346`;
      parts+=circuitValve('inlet',266,second,40,i18n)+circuitPump(146,second,40,i18n);
      if(stages.has('ro'))parts+=circuitMembrane(110,center,true,40,i18n);
      const positions=finish.length===2?[246,310]:[280];
      finish.forEach((key,index)=>{parts+=circuitFinisher(key,positions[index],upper,true,38,i18n);});
      parts+=circuitValve('flush',272,lower,42,i18n);
      parts+=circuitEndpoint('feed',28,21,'Feed','','middle',i18n);
      parts+=circuitEndpoint('product',284,296,'Product',options.productFlow??'—','middle',i18n);
      parts+=circuitEndpoint('waste',284,443,'Concentrate',options.wasteFlow??'—','middle',i18n);
    }
    return `<svg class="circuit ${narrow?'diagram-narrow':'diagram-wide'}" viewBox="0 0 ${width} ${height}" role="group" aria-label="${circuitEscape(i18n.t(showUV?'Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter and UV lamp; concentrate exits through the waste branch.':'Water circuit. Feed passes through the configured prefilters, inlet and pump to the membrane branch. Product passes through the configured postfilter; concentrate exits through the waste branch.'))}"><path class="pipe main-pipe" d="${main}"/><path class="pipe product-pipe" d="${product}"/><path class="pipe concentrate-pipe" d="${waste}"/><path class="stream main-stream" d="${main}"/><path class="stream product-stream" d="${product}"/><path class="stream waste-stream" d="${waste}"/>${parts}</svg>`;
  }
  function diagram(options={}) {
    return `<div class="scroll" role="region" aria-label="${circuitEscape((options.i18n??createI18n()).t('Water circuit diagram'))}">${diagramSvg(false,options)}${diagramSvg(true,options)}</div>`;
  }
  const STYLE = `
    .heading,.status,.caption,.trend-head>span,.circuit-head>span,.peripheral,.diagnostic-row>span,.footer>span{min-width:0;overflow-wrap:anywhere}.status{flex-shrink:0}.circuit-head{flex-wrap:wrap}.peripheral{flex-wrap:wrap}.trend-head{flex-wrap:wrap}

    :host{display:block;container:water-card/inline-size;--water-blue:var(--water-purifier-accent-color,#008cff);--water-ink:var(--primary-text-color,#102a3b);--water-muted:var(--secondary-text-color,#63758a);--water-surface:var(--ha-card-background,var(--card-background-color,#fff));--water-line:var(--divider-color,#e1e9f0);--water-tint:color-mix(in srgb,var(--water-blue) 7%,var(--water-surface));font-family:var(--primary-font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);color:var(--water-ink);line-height:1.4}
    *{box-sizing:border-box}ha-card{display:block;background:var(--water-surface);color:var(--water-ink);border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--water-line));border-radius:var(--ha-card-border-radius,22px);box-shadow:var(--ha-card-box-shadow,none);overflow:hidden}button,input,select,a{font:inherit}button{color:inherit;cursor:pointer;background:none;border:0}button:disabled{cursor:default}button:focus-visible,a:focus-visible,summary:focus-visible,[role=button]:focus-visible{outline:2px solid var(--water-blue);outline-offset:3px}[hidden]{display:none!important}
    header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 28px 18px}.heading{min-width:0;flex:1}.heading h2{font-size:24px;line-height:1.2;font-weight:650;letter-spacing:-.7px;margin:0;overflow-wrap:anywhere}.status{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:550;line-height:1.35;color:var(--water-muted);max-width:45%}.status:before{content:'';width:7px;height:7px;background:currentColor;border-radius:50%;flex-shrink:0}.status.active{color:var(--water-blue)}.status.error{color:var(--error-color,#be4236)}
    .alert{margin:0 28px 16px;padding:10px 12px;border-left:2px solid var(--warning-color,#ae6800);background:var(--water-tint);font-size:12px;line-height:1.5}.retry{font-size:12px;color:var(--water-blue);text-decoration:underline;min-height:44px;margin-left:6px}
    .overview{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1fr);align-items:center;gap:28px;margin:0 28px;padding:14px 0 28px}.quality-stack{display:grid;grid-template-columns:minmax(130px,.9fr) minmax(140px,1fr);align-items:center;gap:24px;min-width:0}.hero{min-width:0}.metric{text-align:left;padding:0;display:block;min-width:0;width:100%}.caption{display:block;font-size:12px;color:var(--water-muted)}.hero .caption{font-size:11px;font-weight:650;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px}.reading{display:flex;align-items:baseline;gap:5px;min-width:0;flex-wrap:wrap}.value{font-variant-numeric:tabular-nums;min-width:0;overflow-wrap:anywhere}.hero .value{font-size:clamp(56px,8.8cqi,110px);font-weight:650;letter-spacing:-.065em;line-height:1}.unit{color:var(--water-muted);font-size:12px;font-weight:400;letter-spacing:0}.hero .unit{font-size:clamp(17px,2.6cqi,28px);color:var(--water-ink);font-weight:550;margin-left:4px}.feed-context{display:flex;flex-wrap:wrap;align-items:baseline;gap:5px;color:var(--water-muted);font-size:13px;padding:10px 0 0;text-align:left;min-height:40px}.feed-context .unit{font-size:inherit}.state-note{display:block;font-size:11px;line-height:1.4;color:var(--water-muted);margin-top:5px}.state-note:empty{display:none}.readings{border-left:1px solid var(--water-line);padding-left:26px;min-width:0}.stat{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;width:100%;padding:15px 0;text-align:left;min-height:58px;border-bottom:1px solid var(--water-line)}.stat:last-child{border:0}.stat .caption{font-size:12px}.stat .reading{margin-left:auto}.stat .value{font-size:23px;font-weight:600;letter-spacing:-.7px;line-height:1.2}.stat .state-note{width:100%;text-align:right;margin:0}.trend{min-width:0}.trend-head{font-size:11px;color:var(--water-muted);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.trend-head button{font-size:11px;color:var(--water-blue);padding:0;min-height:32px}.history-chart{width:100%;display:block;overflow:visible}.history-chart .grid{stroke:var(--water-line);stroke-dasharray:3 5;stroke-width:1}.history-chart .trace{fill:none;stroke:var(--water-blue);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.history-chart .end{fill:var(--water-blue);stroke:var(--water-surface);stroke-width:2}.history-chart text{font-family:inherit;fill:var(--water-muted);font-size:11px}.history-message{min-height:115px;display:grid;align-content:center;gap:5px;color:var(--water-muted);font-size:12px;border-bottom:1px solid var(--water-line)}.history-message small{font-size:11px}.history-note{font-size:10px;color:var(--water-muted);margin:6px 0 0}.history-note:empty{display:none}
    .circuit-section{margin:0 22px;border-top:1px solid var(--water-line)}.circuit-head{padding:20px 6px 2px;display:flex;align-items:center;justify-content:space-between;gap:14px}.circuit-head h3{font-size:12px;letter-spacing:1.5px;font-weight:650;margin:0}.circuit-head span{font-size:11px;color:var(--water-muted)}.scroll{padding:6px 0 12px}.circuit{display:block;width:100%;color:var(--water-ink)}.diagram-narrow{display:none;max-width:360px;margin:0 auto}.pipe{fill:none;stroke:color-mix(in srgb,var(--water-muted) 32%,var(--water-surface));stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.stream{fill:none;stroke:var(--water-blue);stroke-width:2.6;stroke-dasharray:5 22;stroke-linecap:round;opacity:0;animation:water-travel 2.4s linear infinite;animation-play-state:paused}.running .stream,.flushing .main-stream,.flushing .waste-stream{opacity:1;animation-play-state:running}.running .pipe{stroke:color-mix(in srgb,var(--water-blue) 38%,var(--water-surface))}.still .stream,.paused .stream{animation-play-state:paused!important}.part{cursor:pointer;outline:none}.part .body,.part .cap{fill:var(--water-surface);stroke:var(--water-ink);stroke-width:1.5;stroke-linejoin:round}.part .cap{fill:var(--water-tint)}.part .detail,.port{fill:none;stroke:var(--water-ink);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.membrane-fill{fill:var(--water-tint)}.medium-grain{fill:var(--water-muted);opacity:.6}.medium-detail{fill:none;stroke:var(--water-muted);stroke-width:.85;opacity:.65}.membrane-detail{fill:none;stroke:var(--water-blue);stroke-width:1;opacity:.6}.part-hit{fill:transparent;stroke:transparent}.part:hover .body,.part:focus-visible .body{fill:var(--water-tint);stroke:var(--water-blue)}.part:focus-visible .part-hit{stroke:var(--water-blue);stroke-width:1;stroke-dasharray:3 3}.part text,.node-label,.pipe-label{font-family:inherit;fill:var(--water-ink);font-size:14px;font-weight:550;text-anchor:middle}.part .endpoint-label{font-size:12px}.part .sub,.pipe-label.sub{fill:var(--water-muted);font-size:11px;font-weight:400}.pipe-arrow{fill:var(--water-blue)}.stage-detail{margin:0 6px 18px;padding:12px 14px;background:var(--water-tint);border-radius:6px;font-size:12px;line-height:1.6;display:flex;gap:12px;align-items:start}.stage-detail p{margin:0;flex:1}.stage-detail button{min-width:44px;min-height:44px;font-size:22px}.optional{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0 28px;padding:0 0 16px}.peripheral{display:flex;align-items:baseline;gap:8px;font-size:11px;padding:5px 0;min-height:34px}.peripheral span:first-child{color:var(--water-muted)}.peripheral span+span{color:var(--water-ink)}
    .filters{margin:0 28px;padding:22px 0 24px;border-top:1px solid var(--water-line)}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}.section-label{font-size:15px;font-weight:600;letter-spacing:-.3px;margin:0}.reminder-summary{font-size:11px;color:var(--water-muted)}.reminder-summary.attention{color:var(--warning-color,#ae6800)}.filter-grid{display:grid;grid-template-columns:repeat(var(--filter-count,5),minmax(0,1fr));gap:0}.filter-row{position:relative;display:grid;grid-template-rows:auto 20px auto;gap:7px;min-width:0;padding:0 8px;text-align:center}.filter-top{font-size:12px;display:flex;flex-wrap:wrap;justify-content:center;gap:5px}.filter-index{font-size:10px;color:var(--water-muted);align-self:center;font-variant-numeric:tabular-nums}.filter-name{overflow-wrap:anywhere;font-weight:550}.filter-track{height:20px;position:relative;display:grid;place-items:center}.filter-track:before{content:'';height:1px;background:var(--water-line);position:absolute;left:-8px;right:-8px;top:50%}.filter-row.first-visible .filter-track:before{left:50%}.filter-row.last-visible .filter-track:before{right:50%}.filter-dot{position:relative;width:9px;height:9px;border:1.5px solid var(--water-muted);border-radius:50%;background:var(--water-surface)}.filter-state{font-size:11px;line-height:1.45;color:var(--water-muted)}.filter-row.due .filter-state{color:var(--warning-color,#ae6800)}.filter-row.due .filter-dot{border-color:var(--warning-color,#ae6800);background:var(--warning-color,#ae6800);box-shadow:inset 0 0 0 2px var(--water-surface)}.filter-row:focus-visible{outline-offset:0}.filter-row:hover .filter-name{color:var(--water-blue)}
    details.diagnostics{padding:0 28px;border-top:1px solid var(--water-line)}summary{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--water-muted);cursor:pointer;min-height:44px;padding:12px 0;list-style:none}summary::-webkit-details-marker{display:none}summary:after{content:'+';font-size:18px}details[open]>summary:after{content:'−'}.diagnostic-row{display:flex;justify-content:space-between;gap:14px;width:100%;text-align:left;padding:10px 0;min-height:44px;border-top:1px solid var(--water-line);font-size:12px}.diagnostic-row span:first-child{color:var(--water-muted)}.diagnostic-row span:last-child{text-align:right}.footnote{font-size:11px;color:var(--water-muted);margin:12px 0 18px;line-height:1.6}.footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 14px;align-items:center;border-top:1px solid var(--water-line);padding:8px 28px;font-size:11px;color:var(--water-muted)}.footer button,.footer a{font-size:11px;min-height:40px;display:inline-flex;align-items:center;color:var(--water-blue);text-decoration:none;padding:0}.footer a:hover{text-decoration:underline}.empty{margin:0;padding:16px 28px;font-size:13px;line-height:1.6;color:var(--water-muted)}.compact .overview{padding-bottom:18px}.compact .quality-stack{grid-template-columns:1fr}.compact .hero .value{font-size:62px}
    @keyframes water-travel{to{stroke-dashoffset:-54}}@media(prefers-reduced-motion:reduce){.stream{animation:none!important}}
    @container water-card (max-width:820px){.quality-stack{grid-template-columns:1fr;gap:14px}.hero .reading{display:inline-flex}.trend-head{margin-bottom:4px}.history-chart{max-height:115px}.overview{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}.stat{display:block}.stat .caption{margin-bottom:5px}.stat .reading{margin:0}.stat .state-note{text-align:left}.hero .value{font-size:76px}}
    @container water-card (max-width:680px){header{padding:22px 20px 14px}.heading h2{font-size:21px}.status{font-size:12px}.overview{margin-inline:20px;gap:20px;padding-top:8px}.readings{padding-left:20px}.circuit-section{margin-inline:16px}.circuit-head{padding-inline:4px}.diagram-wide{display:none}.diagram-narrow{display:block}.filters{margin-inline:20px}.filter-grid{display:flex;flex-wrap:wrap;row-gap:18px}.filter-row{flex:1 0 30%;max-width:50%;padding-inline:6px}.filter-track:before{left:-6px;right:-6px}.filter-state{font-size:11px}.optional{margin-inline:20px}.footer,details.diagnostics{padding-inline:20px}.alert{margin-inline:20px}}
    @container water-card (max-width:390px){header{padding:20px 16px 12px;gap:12px}.heading h2{font-size:19px}.status{font-size:11px}.overview{margin-inline:16px;gap:14px;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}.hero .value{font-size:62px}.hero .unit{font-size:16px}.hero .caption{font-size:10px;letter-spacing:1px}.readings{padding-left:14px}.stat .value{font-size:21px}.stat .caption{font-size:11px}.stat .unit{font-size:10px}.feed-context{font-size:11px}.quality-stack{gap:6px}.circuit-section{margin-inline:10px}.circuit-head h3{font-size:11px;letter-spacing:1px}.circuit-head span{font-size:10px}.filters{margin-inline:16px}.optional{margin-inline:16px}.footer,details.diagnostics{padding-inline:16px}}
  `;
  const DASHBOARD_STYLE = `

    .status-body.no-quality{grid-template-columns:1fr}
    .dashboard-card{border-radius:var(--ha-card-border-radius,16px);--tile-state:var(--water-muted)}.dashboard-card.is-active{--tile-state:var(--water-blue)}.dashboard-card.is-fault{--tile-state:var(--warning-color,#996100)}
    .tile-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}.tile-title{font-size:14px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}.tile-chevron{width:16px;height:16px;flex:none;fill:none;stroke:var(--water-muted);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.tile-caption{display:block;color:var(--water-muted);font-size:11px;line-height:1.4}.tile-reading{display:flex;align-items:baseline;gap:4px;min-width:0;flex-wrap:wrap}.tile-value{color:var(--water-ink);font-variant-numeric:tabular-nums;font-weight:600;line-height:1.05;letter-spacing:-1.5px;overflow-wrap:anywhere}.tile-unit{font-size:14px;color:var(--water-muted);font-weight:400;letter-spacing:0}.tile-note{display:block;font-size:11px;line-height:1.4;color:var(--water-muted);margin-top:6px;overflow-wrap:anywhere}.tile-note:empty{display:none}.tile-note.live:before{content:'';display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:var(--water-blue)}
    .status-tile{display:flex;flex-direction:column;gap:22px;padding:18px;width:100%;min-height:166px;text-align:left}.status-tile:focus-visible{outline-offset:-4px;border-radius:inherit}.status-body{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(82px,1fr);gap:14px;align-items:center;flex:1}.status-copy{border-left:3px solid var(--tile-state);padding-left:12px;min-width:0}.tile-phase{display:block;font-size:clamp(18px,6cqi,23px);font-weight:600;line-height:1.15;letter-spacing:-.45px;overflow-wrap:anywhere}.tile-context{display:block;color:var(--water-muted);font-size:12px;line-height:1.55;margin-top:8px;overflow-wrap:anywhere}.is-fault .tile-context{color:var(--warning-color,#996100)}.small-quality{min-width:0;text-align:right}.small-quality .tile-caption{margin-bottom:6px}.small-quality .tile-reading{justify-content:flex-end}.small-quality .tile-value{font-size:clamp(30px,11cqi,44px)}.small-quality .tile-note{font-size:10px}
    .dashboard-card .discovery-note{margin:0 18px 12px;color:var(--water-muted);font-size:12px;overflow-wrap:anywhere}.dashboard-card .discovery-note .retry{margin:0 0 0 8px}.dash-head{display:flex;align-items:center;gap:12px;padding:14px 18px 8px}.dash-head .tile-title{border-left:3px solid var(--tile-state);padding-left:10px;flex:1;min-width:0}.dash-status{font-size:11px;line-height:1.4;color:var(--water-muted);text-align:right;max-width:44%;overflow-wrap:anywhere}.dash-status:before{content:'';display:inline-block;width:5px;height:5px;background:var(--tile-state);border-radius:50%;margin-right:5px}.dash-open{display:grid;place-items:center;min-width:36px;min-height:36px;margin-right:-8px;padding:8px}.dash-alert{margin:0 18px 10px;border-left:2px solid var(--tile-state);padding-left:10px;color:var(--water-muted);font-size:12px;line-height:1.5}.is-fault .dash-alert{color:var(--warning-color,#996100)}
    .dash-quality{display:grid;grid-template-columns:minmax(100px,.9fr) minmax(0,1.5fr);gap:18px;align-items:center;margin:0 18px;padding:10px 0 16px}.dash-quality.no-history{grid-template-columns:1fr}.dash-hero{min-width:0}.dash-metric{padding:0;text-align:left;min-height:66px;width:100%;display:block}.dash-metric .tile-caption{margin-bottom:8px}.dash-metric .tile-value{font-size:44px}.dash-metric .tile-unit{font-size:16px}.dash-feed{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;padding:7px 0 0;min-height:28px;text-align:left;color:var(--water-muted);font-size:11px}.dash-feed .unit{font-size:inherit}.dash-feed [data-note]{font-size:10px}.dash-trend{border-left:1px solid var(--water-line);padding-left:16px;min-width:0}.dash-trend .trend-head{margin:0 0 3px;font-size:11px}.dash-trend .trend-head button{min-height:28px}.dash-trend .history-chart{max-height:none}.dash-trend .history-chart text{font-size:15px}.dash-trend .history-chart .grid{stroke-dasharray:none}.dash-trend .history-chart .area{fill:var(--water-blue);opacity:.08}.dash-trend .history-message{min-height:88px;font-size:11px}.dash-trend .history-note{font-size:10px}
    .dash-history{margin:0 18px;border-top:1px solid var(--water-line);padding:10px 0 12px}.dash-section-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:9px}.dash-section-head h3{font-size:12px;font-weight:600;margin:0}.dash-section-head span{font-size:10px;color:var(--water-muted)}.dash-totals{display:grid;grid-template-columns:repeat(var(--total-count,4),minmax(0,1fr));gap:0}.total-metric{padding:0 10px;min-width:0;text-align:left;border-left:1px solid var(--water-line)}.total-metric:first-child{padding-left:0;border-left:0}.total-metric:last-child{padding-right:0}.total-metric .tile-caption{font-size:clamp(10px,2.4cqi,11px);min-height:16px;margin-bottom:6px;overflow-wrap:anywhere}.total-metric .tile-value{font-size:clamp(17px,4.6cqi,23px);letter-spacing:-.6px}.total-metric .tile-unit{font-size:12px}.total-metric .tile-note{font-size:10px;margin-top:4px}
    .dash-care{margin:0 18px;border-top:1px solid var(--water-line)}.care-summary{width:100%;display:flex;align-items:center;gap:12px;padding:14px 0;text-align:left;min-height:64px}.care-copy{min-width:0;flex:1;border-left:3px solid var(--water-line);padding-left:10px}.care-copy .tile-caption{margin-bottom:4px}.care-label{display:block;font-size:12px;font-weight:550;line-height:1.4;overflow-wrap:anywhere}.care-count{font-size:11px;text-align:right;max-width:28%;color:var(--water-muted);overflow-wrap:anywhere}.dash-care.attention .care-copy{border-color:var(--warning-color,#996100)}.dash-care.attention .care-count{color:var(--warning-color,#996100)}.care-summary[aria-expanded=true] .tile-chevron{transform:rotate(90deg)}.care-list{padding:0 0 10px}.care-row{display:flex;align-items:baseline;justify-content:space-between;gap:16px;border-top:1px solid var(--water-line);width:100%;min-height:40px;text-align:left;font-size:12px;padding:10px 0}.care-row span{min-width:0;overflow-wrap:anywhere}.care-row span:last-child{color:var(--water-muted);text-align:right}.care-row.due span:last-child{color:var(--warning-color,#996100)}
    @container water-card (max-width:360px){.status-tile{padding:16px;gap:18px}.status-body{grid-template-columns:minmax(0,1.5fr) minmax(72px,1fr);gap:10px}.status-copy{padding-left:9px}.tile-context{font-size:11px}.small-quality .tile-unit{font-size:12px}.dash-head{gap:8px;padding-inline:14px}.dash-quality{margin-inline:14px;gap:12px;grid-template-columns:minmax(80px,.9fr) minmax(0,1.3fr)}.dash-metric .tile-value{font-size:36px}.dash-trend{padding-left:10px}.dash-history,.dash-care{margin-inline:14px}.dash-totals{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 0}.total-metric:nth-child(odd){padding-left:0;border-left:0}.total-metric .tile-value{font-size:22px}.dash-status{font-size:10px}.care-summary{gap:8px}}
    @container water-card (max-width:280px){.status-body{grid-template-columns:minmax(0,1.2fr) minmax(65px,1fr)}.status-tile{padding:12px}.tile-phase{font-size:17px}.dash-quality{grid-template-columns:1fr}.dash-trend{border-left:0;padding-left:0}.dash-head{flex-wrap:wrap}.dash-head .tile-title{flex:1 0 100%}.dash-status{max-width:calc(100% - 44px);margin-left:auto}.dash-metric .tile-value{font-size:38px}}
  `;
  const CHEVRON = '<svg class="tile-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
  function historyPoints(rows, from, to) {
    const points = [];
    for (const row of rows) {
      const time = Date.parse(row.last_changed ?? row.last_updated);
      const raw = String(row.state ?? '').trim();
      const numeric = raw !== '' && Number.isFinite(Number(raw));
      if (Number.isFinite(time) && time <= to) points.push({t:Math.max(from,time),v:numeric ? Number(raw) : null});
    }
    points.sort((a,b) => a.t-b.t);
    // Keep gaps and extrema when reducing dense history to a small SVG path.
    if (points.length <= 700) return points;
    const stride = Math.ceil(points.length / 240), reduced = [];
    for (let i=0;i<points.length;i+=stride) {
      const bucket=points.slice(i,i+stride), marked=new Set([0,bucket.length-1]);
      let min=-1,max=-1;
      bucket.forEach((p,j) => {if(p.v === null){marked.add(j);if(j) marked.add(j-1);if(j+1<bucket.length) marked.add(j+1);}else{if(min<0 || p.v<bucket[min].v) min=j;if(max<0 || p.v>bucket[max].v) max=j;}});
      if(min>=0) marked.add(min);if(max>=0) marked.add(max);
      [...marked].sort((a,b)=>a-b).forEach(j=>reduced.push(bucket[j]));
    }
    return reduced;
  }
  class WaterPurifierCard extends HTMLElement {
    constructor() {
      super();this.attachShadow({mode:'open'});this._auto={};this._bindings={};this._generation=0;this._unsubscribers=[];
      this._historyToken=0;this._history={status:'idle',points:[]};this._knownAbsent=new Set();
      this._visibility=()=>{this._update();if(!document.hidden)this._requestHistory();};
      this.shadowRoot.addEventListener('click',e=>this._activate(e));
      this.shadowRoot.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-part]')){e.preventDefault();this._activate(e);}});
    }
    static getConfigElement(){return document.createElement(TAG+'-editor');}
    static getStubConfig(){return {type:'custom:'+TAG,layout:'full',entities:{}};}
    _sample(hass,id,kind='text'){return sample(hass,id,kind,this._i18n);}
    _t(key,values){return this._i18n.t(key,values);}
    _title(){return this._config.title??this._t('Water purifier');}
    getCardSize(){return {small:3,medium:6,full:12}[this._config?.layout]??12;}
    getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
    setConfig(config){
      if(!record(config))throw new CardMessageError('Card configuration must be an object.',{},createI18n({},this._hass));
      this._config=normalize({...config,type:config.type??'custom:'+this.localName},this._hass);this._auto={};this._autoDashboard='';this._knownAbsent.clear();this._registryError='';this._registryLoading=false;this._generation++;
      this._historyToken++;this._history={status:'idle',points:[]};this._historyPending=false;
      this._bindings={...this._config.entities};refreshI18n(this);this._build();
      if(this._hass&&this.isConnected)this._loadDevice();
      this._requestHistory();
    }
    set hass(value){
      const changed=this._hass?.connection!==value?.connection;this._hass=value;const localeChanged=refreshI18n(this);
      if(changed){this._historyToken++;this._historyPending=false;this._history={status:'idle',points:[]};}
      if(this.isConnected&&(changed||!this._watching))this._watch();
      if(localeChanged&&this._config)this._build();else this._update();this._requestHistory();
    }
    get hass(){return this._hass;}
    connectedCallback(){
      document.addEventListener('visibilitychange',this._visibility);
      this._historyTimer=setInterval(()=>{this._update();this._requestHistory();},60000);
      if(this._hass)this._watch();this._update();this._requestHistory();
    }
    disconnectedCallback(){
      document.removeEventListener('visibilitychange',this._visibility);clearInterval(this._historyTimer);this._unwatch();this._generation++;this._historyToken++;
      if(this._historyPending)this._history=this._history.status==='loading'?{status:'idle',points:[]}:{...this._history,at:0};
      this._historyPending=false;
    }
    _unwatch(){this._watching=false;this._watchToken=(this._watchToken??0)+1;this._unsubscribers.splice(0).forEach(fn=>{try{Promise.resolve(fn()).catch(()=>{});}catch{}});}
    _watch(){
      this._unwatch();this._watching=true;const token=this._watchToken,connection=this._hass?.connection;
      this._transportDown=connection?.connected===false;
      if(connection?.addEventListener){
        const ready=()=>{this._transportDown=false;this._loadDevice(true);this._update();this._requestHistory(true);};
        const disconnected=()=>{this._transportDown=true;this._update();};
        connection.addEventListener('ready',ready);connection.addEventListener('disconnected',disconnected);
        this._unsubscribers.push(()=>{connection.removeEventListener('ready',ready);connection.removeEventListener('disconnected',disconnected);});
      }
      if(connection?.subscribeEvents)for(const event of ['entity_registry_updated','device_registry_updated']){
        Promise.resolve(connection.subscribeEvents(()=>this._loadDevice(true),event)).then(off=>{if(!this.isConnected||token!==this._watchToken)off();else this._unsubscribers.push(off);}).catch(()=>{});
      }
      this._loadDevice(true);
    }
    async _loadDevice(refresh=false){
      if(!this._config?.device_id||!this._hass||!this.isConnected){this._registryLoading=false;this._update();return;}
      const generation=++this._generation,id=this._config.device_id;this._registryLoading=true;this._update();
      try{
        const registry=await registries(this._hass,refresh);
        if(generation!==this._generation||!this.isConnected)return;
        this._auto=mappingFor(registry,id);this._autoDashboard=dashboardUrl(registry.devices.find(d=>d.id===id)?.configuration_url);this._registryError='';
      }catch(error){if(generation!==this._generation)return;this._auto={};this._autoDashboard='';this._registryError=error?.key?error:new CardMessageError('Could not discover entities. Use manual mappings.');}
      if(generation!==this._generation)return;
      this._registryLoading=false;const previousProduct=this._bindings.product_tds;this._bindings={...this._auto,...this._config.entities};
      if(previousProduct!==this._bindings.product_tds){this._historyToken++;this._historyPending=false;this._history={status:'idle',points:[]};}
      this._build();this._requestHistory();
    }
    _metric(key){
      const t=this._i18n.html;
      const f=FIELD[key],id=this._bindings[key];if(!id)return '';
      const label={flow:this._t("Product flow"),water_total:this._t("Total produced"),product_temperature:this._t("Temperature")}[key]??fieldLabel(f,this._i18n);
      return `<button class="stat" data-entity="${esc(id)}" aria-label="${t('{name} details',{name:label})}"><span class="caption">${esc(label)}</span><span class="reading"><span class="value" data-value="${key}">—</span><span class="unit" data-unit="${key}"></span></span><small class="state-note" data-note="${key}"></small></button>`;
    }
    _showUV(){
      const b=this._bindings,s=this._sample(this._hass,b.uv_enabled);
      if(s.status==='valid'&&['disabled','off','false','0'].includes(s.raw.toLowerCase()))return false;
      return !!(b.uv_enabled||b.uv||b.uv_status);
    }
    _stateView(h){
      const b=this._bindings,phase=this._sample(h,b.state),fault=this._sample(h,b.fault);
      if(!h||h.connected===false||h.connection?.connected===false)
        return {title:this._t("Unavailable"),detail:this._t("Home Assistant disconnected"),available:false};
      if(phase.status!=='valid')return {title:phase.status==='unbound'?this._t("Set up device"):this._t("Unavailable"),
        detail:phase.status==='unbound'?this._t("Select a device or map its state"):phase.status==='missing'?this._t("State entity not found"):this._t("Device state unavailable"),available:false};
      const uv=this._sample(h,b.uv_status);
      const reason=fault.status==='valid'&&fault.raw!=='none'?fault.raw:uv.status==='valid'&&uv.raw.startsWith('uv_')?uv.raw:null;
      if(reason||phase.raw==='fault')return {title:reason?.startsWith('uv_')?this._t("UV fault"):this._t("Needs attention"),
        detail:reason?(has(TEXT,reason)?this._t(TEXT[reason]):reason):this._t("Controller reports a fault"),available:true,faulted:true,phase:phase.raw};
      if(b.fault&&fault.status!=='valid')return {title:this._t("Status unknown"),detail:this._t("Fault status unavailable"),available:true,phase:phase.raw};
      const titles={producing:this._t("Purifying"),idle:this._t("Standby"),locked:this._t("Locked"),preparing:this._t("Starting"),preflush:this._t("Pre-rinse"),postflush:this._t("Post-rinse"),flushing:this._t("Rinsing"),maintenance:this._t("Maintenance"),testing:this._t("Output test")};
      const running=phase.raw==='producing',rinsing=['preflush','postflush','flushing'].includes(phase.raw);
      let detail=phase.raw==='idle'?this._t("Not producing"):phase.raw==='locked'?this._t("Open controller for details"):'';
      if(running&&b.flow){const flow=this._sample(h,b.flow,'number');detail=flow.status==='valid'?flow.text+' '+(flow.obj.attributes?.unit_of_measurement??'L/min'):this._t("Flow unavailable");}
      return {title:has(titles,phase.raw)?titles[phase.raw]:phase.text,detail,
        available:true,known:true,running,active:running||rinsing,phase:phase.raw};
    }
    _dashboardUrl(){return has(this._config,'dashboard_url')?dashboardUrl(this._config.dashboard_url):this._autoDashboard;}
    _canOpenDetails(){return !!(this._dashboardUrl()||['state','fault','product_tds'].some(k=>this._hass?.states?.[this._bindings[k]]));}
    _openDetails(){
      const h=this._transportDown?null:this._hass,view=this._stateView(h);
      if(view.faulted&&this._hass?.states?.[this._bindings.fault])return this._moreInfo(this._bindings.fault);
      const url=this._dashboardUrl();if(url){window.open(url,'_blank','noopener,noreferrer');return;}
      const key=['state','product_tds','fault'].find(k=>this._hass?.states?.[this._bindings[k]]);
      if(key)this._moreInfo(this._bindings[key]);
    }
    _buildDashboard(){
      const t=this._i18n.html;
      const c=this._config,b=this._bindings,small=c.layout==='small',showProduct=b.product_tds!==null,history=!small&&c.show_history&&!!b.product_tds;
      const totals=[['water_total',this._t("Product total")],['waste_total',this._t("Waste total")],['production_hours',this._t("Production time")],['starts',this._t("Starts")]].filter(([key])=>b[key]);
      const quality=`<span class="tile-caption">${t("Product TDS")}</span><span class="tile-reading"><span class="tile-value" data-value="product_tds">—</span><span class="tile-unit" data-unit="product_tds"></span></span><span class="tile-note" data-role="quality-note"></span>`;
      const discovery=`<div class="discovery-note" data-role="discovery" hidden><span data-role="discovery-text"></span><button class="retry" data-action="retry">${t("Retry discovery")}</button></div>`;
      this.shadowRoot.innerHTML=`<style>${STYLE}${DASHBOARD_STYLE}</style><ha-card class="dashboard-card ${small?'small-card':'medium-card'}">
        ${small?`<button class="status-tile" data-action="details" aria-label="${t('{name} details',{name:this._title()})}">
          <span class="tile-title-row"><span class="tile-title">${esc(this._title())}</span>${CHEVRON}</span>
          <span class="status-body${showProduct?'':' no-quality'}"><span class="status-copy"><span class="tile-phase" data-role="tile-phase" role="status">${t("Waiting")}</span><span class="tile-context" data-role="tile-context"></span></span>${showProduct?`<span class="small-quality">${quality}</span>`:''}</span>
        </button>${discovery}`:`
        <div class="dash-head"><span class="tile-title">${esc(this._title())}</span><span class="dash-status" data-role="tile-phase" role="status">${t("Waiting")}</span><button class="dash-open" data-action="details" aria-label="${t('{name} details',{name:this._title()})}">${CHEVRON}</button></div>
        ${discovery}<div class="dash-alert" data-role="tile-alert" role="status" hidden></div>
        ${showProduct||b.feed_tds?`<div class="dash-quality ${history?'':'no-history'}"><div class="dash-hero">${showProduct?`<button class="dash-metric" data-entity="${esc(b.product_tds??'')}" aria-label="${t('{name} details',{name:this._t('Product TDS')})}">${quality}</button>`:''}
        ${b.feed_tds?`<button class="dash-feed" data-entity="${esc(b.feed_tds)}" aria-label="${t('{name} details',{name:this._t('Feed TDS')})}"><span>${t("Feed")}</span><span data-value="feed_tds">—</span><span class="unit" data-unit="feed_tds"></span><span data-note="feed_tds"></span></button>`:''}</div>
        ${history?`<div class="dash-trend"><div class="trend-head"><span>${t(c.history_hours===1?'Last hour':'Last {count} hours',{count:this._i18n.number(c.history_hours,0)})}</span><button data-entity="${esc(b.product_tds)}" aria-label="${t("Product TDS history")}">${t("History ↗")}</button></div><div data-role="history"></div></div>`:''}</div>`:''}
        ${totals.length?`<section class="dash-history" aria-label="${t("Cumulative usage, independent of the chart time range")}"><div class="dash-section-head"><h3>${t("Usage history")}</h3><span>${t("Cumulative")}</span></div><div class="dash-totals" style="--total-count:${totals.length}">${totals.map(([key,label])=>`<button class="total-metric" data-entity="${esc(b[key])}" aria-label="${t(key==='production_hours'?'{name} details, accumulated commanded production time':'{name} details',{name:label})}"><span class="tile-caption">${esc(label)}</span><span class="tile-reading"><span class="tile-value" data-value="${key}">—</span><span class="tile-unit" data-unit="${key}"></span></span><span class="tile-note" data-note="${key}"></span></button>`).join('')}</div></section>`:''}
        ${this._filters.length?`<section class="dash-care" data-role="care"><button class="care-summary" data-action="filter-details" aria-expanded="false" aria-controls="care-list"><span class="care-copy"><span class="tile-caption">${t("Filter care")}</span><span class="care-label" data-role="care-label"></span></span><span class="care-count" data-role="care-count"></span>${CHEVRON}</button><div class="care-list" id="care-list" hidden>${this._filters.map((f,i)=>`<button class="care-row" data-care-filter="${i}" data-entity="${esc(f.entity)}"><span>${esc(f.name)}</span><span data-care-value="${i}"></span></button>`).join('')}</div></section>`:''}`}
      </ha-card>`;
      this._update();this._drawHistory();
    }
    _updateDashboard(){
      const h=this._transportDown?null:this._hass,b=this._bindings,r=this.shadowRoot,view=this._stateView(h);
      // A retained entity value must not masquerade as live device data after phase availability expires.
      const readings=view.available?h:null,small=this._config.layout==='small',card=r.querySelector('ha-card');
      card.classList.toggle('is-active',!!view.active);card.classList.toggle('is-fault',!!view.faulted);
      r.querySelector('[data-role=tile-phase]').textContent=view.title;
      const context=r.querySelector('[data-role=tile-context]');if(context)context.textContent=view.detail;
      const alert=r.querySelector('[data-role=tile-alert]');if(alert){alert.hidden=!!view.known;alert.textContent=view.detail;}
      const discovery=r.querySelector('[data-role=discovery]');discovery.hidden=!this._registryError&&!this._registryLoading;
      r.querySelector('[data-role=discovery-text]').textContent=this._registryLoading?this._t('Loading device entities…'):errorMessage(this._registryError,this._i18n);
      r.querySelector('[data-action=retry]').hidden=!this._registryError||this._registryLoading;
      for(const f of FIELDS){
        const s=this._sample(readings,b[f.key],f.kind);
        r.querySelectorAll(`[data-value="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'?s.text:f.kind==='number'?'—':s.text;});
        r.querySelectorAll(`[data-unit="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'&&f.kind==='number'?(s.obj.attributes?.unit_of_measurement??f.unit):'';});
        r.querySelectorAll(`[data-note="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'?'':!view.available&&b[f.key]?this._t("Unavailable"):s.text;});
      }
      const product=this._sample(readings,b.product_tds,'number'),note=r.querySelector('[data-role=quality-note]');
      if(note){
        note.textContent=product.status!=='valid'?b.product_tds&&!view.available?this._t("Unavailable"):product.text:view.running?this._t("Live"):this._t("Latest reading");
        note.classList.toggle('live',product.status==='valid'&&!!view.running);
      }
      r.querySelectorAll('[data-entity]').forEach(el=>{el.disabled=!this._hass?.states?.[el.dataset.entity];});
      const details=r.querySelector('[data-action=details]');details.disabled=!this._canOpenDetails();
      if(small)details.setAttribute('aria-label',[this._title(),view.title,view.detail,note?this._t('Product TDS')+' '+(product.status==='valid'?product.text+' '+(product.obj.attributes?.unit_of_measurement??'ppm'):note.textContent):'',this._t("Open details")].filter(Boolean).join(', '));
      const deviceUnavailable=!view.available&&h&&h.connected!==false&&h.connection?.connected!==false;
      this._updateCare(readings,deviceUnavailable?this._t("Device data unavailable"):'');this._drawHistory();
    }
    _updateCare(h,unavailableText=''){
      const r=this.shadowRoot,section=r.querySelector('[data-role=care]');if(!section)return;
      const rows=this._filters.map((f,i)=>{
        const s=this._sample(h,f.entity),el=r.querySelector(`[data-care-filter="${i}"]`);
        if(unavailableText)s.text=unavailableText;
        if(s.status==='valid'){if(s.raw==='not_fitted')this._knownAbsent.add(f.entity);else this._knownAbsent.delete(f.entity);}
        const hidden=this._config.filters===undefined&&this._knownAbsent.has(f.entity);
        el.hidden=hidden;el.classList.toggle('due',s.raw==='due');
        r.querySelector(`[data-care-value="${i}"]`).textContent=s.raw==='disabled'?this._t("Reminder off"):s.text;
        return {...f,s,hidden};
      }).filter(f=>!f.hidden);
      section.hidden=!rows.length;if(!rows.length)return;
      const due=rows.filter(f=>f.s.raw==='due');
      const uncertain=rows.filter(f=>f.s.status!=='valid'||!['due','within_limits','disabled','not_fitted'].includes(f.s.raw));
      const disabled=rows.filter(f=>f.s.raw==='disabled');
      const absent=rows.filter(f=>f.s.raw==='not_fitted');
      let label,count,tone=false;
      if(due.length){label=this._t('{name} · Replacement due',{name:due[0].name});count=this._t('Due: {count}',{count:this._i18n.number(due.length,0)})+(uncertain.length?' · '+this._t('Unknown: {count}',{count:this._i18n.number(uncertain.length,0)}):'');tone=true;}
      else if(uncertain.length){const f=uncertain[0];label=f.name+' · '+f.s.text;count=this._t("Review");tone=true;}
      else if(disabled.length){label=disabled.length===rows.length?this._t("Reminders are off"):this._t('{name} · Reminder off',{name:disabled[0].name});count=this._t('Off: {count}',{count:this._i18n.number(disabled.length,0)});}
      else if(absent.length===rows.length){label=this._t("No installed filters in this list");count=this._t("Not fitted");}
      else{label=this._t("No replacement reminders due");count=this._t('Plans: {count}',{count:this._i18n.number(rows.length-absent.length,0)});}
      r.querySelector('[data-role=care-label]').textContent=label;r.querySelector('[data-role=care-count]').textContent=count;
      section.classList.toggle('attention',tone);
    }
    _stageKeys(){
      const list=this._config.filters;
      return list?.length&&list.every(f=>f.stage)?Object.keys(STAGES).filter(key=>list.some(f=>f.stage===key)):Object.keys(STAGES);
    }
    _build(){
      if(!this._config)return;refreshI18n(this);
      const t=this._i18n.html;
      const c=this._config,b=this._bindings,full=c.layout==='full',heroKey=b.product_tds?'product_tds':b.feed_tds?'feed_tds':null;
      this._filters=c.filters??[1,2,3,4,5,6,7,8].filter(n=>b['filter_'+n]).map(n=>({name:this._t('Filter {count}',{count:this._i18n.number(n,0)}),entity:b['filter_'+n]}));
      if(!full){this._buildDashboard();return;}
      const diagnostics=['feed_temperature','waste_flow','waste_total','recovery','fault','outputs','uptime','production_hours','starts','faults','pump_voltage','pump_current','uv_voltage','uv_current','uv_enabled','uv_status'].filter(k=>b[k]);
      const dashboard=has(c,'dashboard_url')?dashboardUrl(c.dashboard_url):this._autoDashboard;
      const showHistory=full&&c.show_history&&!!b.product_tds;
      this._diagramUV=this._showUV();
      this.shadowRoot.innerHTML=`<style>${STYLE}</style><ha-card class="${full?'full':'compact'}">
        <header><div class="heading"><h2>${esc(this._title())}</h2></div><span class="status" data-role="status" role="status">${t("Not configured")}</span></header>
        <div class="alert" data-role="alert" hidden></div>
        <div class="alert" data-role="discovery" hidden><span data-role="discovery-text"></span><button class="retry" data-action="retry">${t("Retry discovery")}</button></div>
        <div class="overview"><div class="quality-stack"${showHistory?'':' style="grid-template-columns:1fr"'}>
        ${heroKey?`<div class="hero"><button class="metric" data-entity="${esc(b[heroKey])}" aria-label="${t('{name} details',{name:this._t(heroKey==='product_tds'?'Product TDS':'Feed TDS')})}"><span class="caption">${t(heroKey==='product_tds'?'Product TDS':'Feed TDS')}</span><span class="reading"><span class="value" data-value="${heroKey}">—</span><span class="unit" data-unit="${heroKey}"></span></span><small class="state-note" data-note="${heroKey}"></small></button>${heroKey==='product_tds'&&b.feed_tds?`<button class="feed-context" data-entity="${esc(b.feed_tds)}"><span>${t("Feed")}</span><span data-value="feed_tds">—</span><span class="unit" data-unit="feed_tds"></span><span data-note="feed_tds"></span></button>`:''}</div>`:`<p class="empty">${t("Map product TDS to see water quality.")}</p>`}
        ${showHistory?`<div class="trend"><div class="trend-head"><span>${t(c.history_hours===1?'Last hour':'Last {count} hours',{count:this._i18n.number(c.history_hours,0)})}</span><button data-entity="${esc(b.product_tds)}">${t("History ↗")}</button></div><div data-role="history"></div></div>`:''}</div>
        <div class="readings">${['flow','product_temperature','water_total'].map(k=>this._metric(k)).join('')}</div></div>
        ${full?`<section class="circuit-section"><div class="circuit-head"><h3>${t("WATER CIRCUIT")}</h3><span data-role="circuit-state">${t("Tap a component to inspect")}</span></div><div class="scroll" data-role="diagram" role="region" aria-label="${t("Water circuit")}"></div><div class="stage-detail" data-role="detail" hidden><p tabindex="-1" data-role="detail-text"></p><button data-action="close" aria-label="${t("Close component details")}">×</button></div></section>`:''}
        ${full?`<div class="optional">${['uv','leak','pump','inlet','flush','pressure'].filter(k=>b[k]).map(k=>`<button class="peripheral" data-entity="${esc(b[k])}"${k==='uv'?' data-role="uv-reading"':''}><span>${esc(fieldLabel(FIELD[k],this._i18n))}</span><span data-value="${k}">—</span><span data-unit="${k}"></span></button>`).join('')}</div>`:''}
        ${full&&this._filters.length?`<section class="filters" data-role="filters"><div class="section-heading"><h3 class="section-label">${t("Filter care")}</h3><span class="reminder-summary" data-role="reminder-summary"></span></div><div class="filter-grid" style="--filter-count:${this._filters.length}">${this._filters.map((f,i)=>`<button class="filter-row" data-filter="${i}" data-entity="${esc(f.entity)}"><span class="filter-top"><span class="filter-index">${String(i+1).padStart(2,'0')}</span><span class="filter-name">${esc(f.name)}</span></span><span class="filter-track" aria-hidden="true"><span class="filter-dot"></span></span><span class="filter-state" data-filter-value="${i}">—</span></button>`).join('')}</div></section>`:''}
        ${full?`<details class="diagnostics"><summary>${t("More readings & diagnostics")}</summary>${diagnostics.map(k=>`<button class="diagnostic-row" data-entity="${esc(b[k])}"><span>${esc(fieldLabel(FIELD[k],this._i18n))}</span><span><span data-value="${k}">—</span> <span data-unit="${k}"></span></span></button>`).join('')}<p class="footnote">${t("Read-only. Water animation follows the controller phase; it is not flow or valve feedback. UV command does not verify disinfection. Filter reminders are reported plan states, not estimated remaining life. Circuit stages follow your card configuration; MQTT does not report filter types or plumbing. History comes from Home Assistant Recorder.")}</p></details>`:''}
        ${!Object.values(b).some(Boolean)?`<p class="empty">${t("Choose your WATER device in the card editor, or map Home Assistant entities.")}</p>`:''}
        <footer class="footer"><span data-role="footer-state">${t("Waiting for Home Assistant")}</span>${dashboard?`<a href="${esc(dashboard)}" target="_blank" rel="noopener noreferrer">${t("Open device dashboard ↗")}</a>`:b.state?`<button data-entity="${esc(b.state)}">${t("Controller details ↗")}</button>`:''}</footer>
      </ha-card>`;
      this._renderDiagram();this._update();this._drawHistory();
    }
    _renderDiagram(){
      const el=this.shadowRoot.querySelector('[data-role=diagram]');if(!el)return;
      const options={showUV:this._diagramUV,activeStages:this._stageKeys(),i18n:this._i18n};
      el.innerHTML=diagramSvg(false,options)+diagramSvg(true,options);
    }
    _update(){
      if(!this._config||!this.shadowRoot.querySelector('ha-card'))return;
      if(this._config.layout!=='full'){this._updateDashboard();return;}
      const h=this._transportDown?null:this._hass,b=this._bindings,root=this.shadowRoot;
      const current=this._sample(h,b.state),fault=this._sample(h,b.fault),connected=!!h&&h.connected!==false&&h.connection?.connected!==false;
      const faulted=fault.status==='valid'&&fault.raw!=='none'||current.raw==='fault';
      const known=connected&&current.status==='valid'&&!faulted&&(!b.fault||fault.status==='valid');
      const running=known&&current.raw==='producing',flushing=known&&['preflush','postflush','flushing'].includes(current.raw);
      const card=root.querySelector('ha-card');card.classList.toggle('running',running);card.classList.toggle('flushing',flushing);card.classList.toggle('still',!this._config.animate);card.classList.toggle('paused',document.hidden);
      const status=root.querySelector('[data-role=status]');status.textContent=!connected?this._t("HA disconnected"):current.status==='unbound'?this._t("State not mapped"):current.text;status.classList.toggle('active',running||flushing);status.classList.toggle('error',faulted);
      const alert=root.querySelector('[data-role=alert]');alert.hidden=!faulted;alert.textContent=fault.status==='valid'&&fault.raw!=='none'?this._t('Device fault · {name}',{name:fault.text}):this._t("Controller stopped by a fault. Open state details.");
      const discovery=root.querySelector('[data-role=discovery]');discovery.hidden=!this._registryError&&!this._registryLoading;
      root.querySelector('[data-role=discovery-text]').textContent=this._registryLoading?this._t('Loading device entities…'):errorMessage(this._registryError,this._i18n);
      root.querySelector('[data-action=retry]').hidden=!this._registryError||this._registryLoading;
      if(this._diagramUV!==this._showUV()){this._diagramUV=this._showUV();this._renderDiagram();}
      for(const f of FIELDS){
        if(!b[f.key])continue;const s=this._sample(h,b[f.key],f.kind);
        root.querySelectorAll(`[data-value="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'?s.text:f.kind==='number'?'—':s.text;});
        root.querySelectorAll(`[data-unit="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'&&f.kind==='number'?(s.obj.attributes?.unit_of_measurement??f.unit):'';});
        root.querySelectorAll(`[data-note="${f.key}"]`).forEach(el=>{el.textContent=s.status==='valid'?'':s.text;});
      }
      for(const [part,key] of [['product','flow'],['waste','waste_flow']]){
        const s=this._sample(h,b[key],'number');const value=s.status==='valid'?s.text+' '+(s.obj.attributes?.unit_of_measurement??FIELD[key].unit):b[key]?s.text:'';
        root.querySelectorAll(`[data-circuit-flow="${part}"]`).forEach(el=>{el.textContent=value;});
      }
      const circuitState=root.querySelector('[data-role=circuit-state]');if(circuitState)circuitState.textContent=running?this._t("Purifying · tap to inspect"):flushing?this._t("Flushing · tap to inspect"):this._t("Tap a component to inspect");
      const uvReading=root.querySelector('[data-role=uv-reading]');if(uvReading)uvReading.hidden=!this._diagramUV;
      let visible=0,due=0,unknown=0;
      this._filters.forEach((f,i)=>{
        const s=this._sample(h,f.entity),row=root.querySelector(`[data-filter="${i}"]`),el=root.querySelector(`[data-filter-value="${i}"]`);if(!row||!el)return;
        if(s.status==='valid'){if(s.raw==='not_fitted')this._knownAbsent.add(f.entity);else this._knownAbsent.delete(f.entity);}
        row.hidden=this._config.filters===undefined&&this._knownAbsent.has(f.entity);
        el.textContent=s.raw==='disabled'?this._t("Reminder off"):s.raw==='due'?this._t("Service due"):s.text;row.classList.toggle('due',s.raw==='due');
        if(!row.hidden){visible++;if(s.raw==='due')due++;if(s.status!=='valid'||['calendar_unknown','not_installed'].includes(s.raw))unknown++;}
      });
      const visibleRows=[...root.querySelectorAll('[data-filter]')].filter(row=>!row.hidden);
      root.querySelectorAll('[data-filter]').forEach(row=>{row.classList.toggle('first-visible',row===visibleRows[0]);row.classList.toggle('last-visible',row===visibleRows[visibleRows.length-1]);});
      const filters=root.querySelector('[data-role=filters]');if(filters)filters.hidden=visible===0;
      root.querySelector('.filter-grid')?.style.setProperty('--filter-count',String(Math.max(1,visible)));
      const summary=root.querySelector('[data-role=reminder-summary]');if(summary){summary.textContent=due?this._t('Service reminders: {count}',{count:this._i18n.number(due,0)}):unknown?this._t("Review plan status"):this._t('Filter plans: {count}',{count:this._i18n.number(visible,0)});summary.classList.toggle('attention',due>0);}
      root.querySelectorAll('[data-entity]').forEach(el=>{el.disabled=!h?.states?.[el.dataset.entity];});
      const stamp=Date.parse(current.obj?.last_updated??current.obj?.last_changed),age=Math.max(0,(Date.now()-stamp)/1000);
      root.querySelector('[data-role=footer-state]').textContent=!connected?this._t("Home Assistant disconnected"):current.status!=='valid'?this._t("State unavailable"):Number.isFinite(age)?age<60?this._t("Updated just now"):this._t('Updated {count} min ago',{count:this._i18n.number(Math.floor(age/60),0)}):this._t("Via Home Assistant");
      this._drawHistory();
    }
    async _requestHistory(force=false){
      const c=this._config,h=this._hass,id=this._bindings.product_tds;
      if(!c||!c.show_history||!['full','medium'].includes(c.layout)||!id||!this.isConnected||document.hidden||this._transportDown||!h||h.connected===false||h.connection?.connected===false)return;
      const key=id+':'+c.history_hours,now=Date.now();
      if(this._historyPending||(!force&&this._history.key===key&&now-this._history.at<60000))return;
      const token=++this._historyToken;this._historyPending=true;
      const fromMs=now-c.history_hours*3600000;
      const observed=this._sample(h,id,'number');
      const previous=this._history.key===key&&this._history.status==='ready'?this._history:null;
      this._history=previous?{...previous,at:now}:{status:'loading',points:[],key,at:now,from:fromMs,to:now};this._drawHistory();
      let timeout;
      try{
        if(typeof h.callApi!=='function')throw new Error('History API unavailable');
        const from=new Date(fromMs).toISOString(),to=new Date(now).toISOString();
        const path='history/period/'+encodeURIComponent(from)+'?filter_entity_id='+encodeURIComponent(id)+'&end_time='+encodeURIComponent(to)+'&minimal_response&no_attributes&significant_changes_only=0';
        const response=await Promise.race([h.callApi('GET',path),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('History request timed out')),20000);})]);
        if(token!==this._historyToken||!this.isConnected)return;
        if(!Array.isArray(response)||response.some(group=>!Array.isArray(group)))throw new Error('Unexpected history response');
        const rows=response[0]??[];
        const points=historyPoints(rows,fromMs,now);
        // Recorder can lag the latest entity transition. Preserve its known gap boundary.
        const observedAt=Date.parse(observed.obj?.last_changed??observed.obj?.last_updated);
        if(points.length&&Number.isFinite(observedAt)&&observedAt>=fromMs&&observedAt<=now&&observedAt>=points[points.length-1].t){
          points.push({t:observedAt,v:observed.status==='valid'?observed.number:null});
        }
        const last=points[points.length-1];
        if(last&&observed.status==='valid'&&last.v===observed.number)points.push({t:now,v:last.v});
        this._history={...this._history,from:fromMs,to:now,points,status:points.some(p=>p.v!==null)?'ready':'empty'};
      }catch{if(token!==this._historyToken)return;this._history={...this._history,points:[],status:'error'};}
      finally{clearTimeout(timeout);if(token===this._historyToken){this._historyPending=false;this._drawHistory();}}
    }
    _drawHistory(){
      const t=this._i18n.html;
      const el=this.shadowRoot.querySelector('[data-role=history]');if(!el)return;
      const h=this._transportDown?null:this._hass;
      const current=this._config.layout==='medium'&&!this._stateView(h).available?null:h;
      const state=this._history,live=this._sample(current,this._bindings.product_tds,'number');
      if(el._waterHistory===state&&el._waterLive===live.status&&el._waterLocale===this._localeSignature)return;
      el._waterHistory=state;el._waterLive=live.status;el._waterLocale=this._localeSignature;
      if(state.status!=='ready'){
        const message={idle:this._t("Waiting for history"),loading:this._t("Loading history…"),empty:this._t("No recorded history"),error:this._t("History unavailable")}[state.status]??this._t("History unavailable");
        el.innerHTML=`<div class="history-message">${esc(message)}${['error','empty'].includes(state.status)&&live.status==='valid'?`<small>${t("Live readings remain available.")}</small>`:''}</div>`;return;
      }
      const valid=state.points.filter(p=>p.v!==null);if(!valid.length)return;
      let min=Math.min(...valid.map(p=>p.v)),max=Math.max(...valid.map(p=>p.v));const pad=Math.max((max-min)*.15,1);min=min<0?min-pad:Math.max(0,min-pad);max+=pad;
      const x=t=>8+(t-state.from)/(state.to-state.from)*344,y=v=>100-(v-min)/(max-min)*88;
      let path='',segment='',firstX='',lastX='';const areas=[];
      const closeSegment=()=>{if(segment)areas.push(segment+'L'+lastX+' 100L'+firstX+' 100Z');segment='';};
      for(const p of state.points){
        if(p.v===null){closeSegment();continue;}
        const xx=x(p.t).toFixed(1),yy=y(p.v).toFixed(1),command=(segment?'L':'M')+xx+' '+yy;
        if(!segment)firstX=xx;lastX=xx;segment+=command;path+=command;
      }
      closeSegment();
      const last=state.points[state.points.length-1],clock=this._i18n.clock;
      el.innerHTML=`<svg class="history-chart" viewBox="0 0 360 132" role="img" aria-label="${t('Recorded product TDS trend. From {from} to {to}. Gaps indicate missing readings.',{from:clock(state.from),to:clock(state.to)})}"><path class="grid" d="M8 12H352M8 56H352M8 100H352"/><text x="8" y="10">${esc(this._i18n.number(max,0))}</text>${this._config.layout==='medium'?`<path class="area" d="${areas.join('')}"/>`:''}<path class="trace" d="${path}"/>${last.v!==null?`<circle class="end" cx="${x(last.t).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="3.5"/>`:''}<text x="8" y="127">${esc(clock(state.from))}</text><text x="352" y="127" text-anchor="end">${esc(clock(state.to))}</text></svg><p class="history-note">${live.status!=='valid'?t('Recorded history · live reading unavailable'):state.points.some(p=>p.v===null)?t('Gaps indicate unavailable readings'):''}</p>`;
    }
    _moreInfo(id){if(id&&this._hass?.states?.[id])this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:id},bubbles:true,composed:true}));}
    _activate(event){
      const target=event.target.closest('[data-entity],[data-part],[data-action]');if(!target||target.disabled)return;
      if(target.dataset.entity)return this._moreInfo(target.dataset.entity);
      if(target.dataset.action==='retry')return this._loadDevice(true);
      if(target.dataset.action==='details')return this._openDetails();
      if(target.dataset.action==='filter-details'){
        const list=this.shadowRoot.querySelector('#care-list');if(!list)return;
        list.hidden=!list.hidden;target.setAttribute('aria-expanded',String(!list.hidden));return;
      }
      if(target.dataset.action==='close'){this.shadowRoot.querySelector('[data-role=detail]').hidden=true;this._detailTrigger?.focus();return;}
      const part=target.dataset.part;if(!part)return;
      const stageEntity=this._filters.find(f=>f.stage===part)?.entity;
      const key={outlet:'product_tds',product:'flow',feed:'feed_tds',waste:'waste_flow'}[part]??part;
      const id=has(STAGES,part)?has(this._config.stages,part)?this._config.stages[part]:stageEntity:this._bindings[key];
      if(id&&this._hass?.states?.[id])return this._moreInfo(id);
      const label=has(STAGES,part)?this._t(STAGES[part][1]):has(FIELD,key)?fieldLabel(FIELD[key],this._i18n):this._t('Water circuit');
      const detail=this.shadowRoot.querySelector('[data-role=detail]');if(!detail)return;
      this._detailTrigger=target;detail.hidden=false;const text=this.shadowRoot.querySelector('[data-role=detail-text]');
      text.textContent=label+'. '+(id?this._t("The mapped entity is not present in Home Assistant."):has(STAGES,part)?this._t("Assign a verified filter reminder to this stage in the card editor."):this._t("No individual status entity is mapped. Controller phase does not prove the physical component state."));text.focus({preventScroll:true});
    }
  }
  const EDITOR_STYLE = `
    label,.pair>*{min-width:0;overflow-wrap:anywhere}input,select{min-width:0;max-width:100%}button,summary{white-space:normal;overflow-wrap:anywhere}

    :host{display:block;color:var(--primary-text-color,#173448);font-family:var(--primary-font-family,Roboto,Arial,sans-serif);font-size:14px}*{box-sizing:border-box}h3{font-size:14px;margin:4px 0 14px}label{display:grid;gap:7px;font-size:12px;color:var(--secondary-text-color,#5e7282);margin-bottom:14px}input,select,button{font:inherit;color:var(--primary-text-color,#173448);background:var(--ha-card-background,var(--card-background-color,white));border:1px solid var(--divider-color,#ccd9e3);border-radius:5px;min-height:42px;padding:9px 10px;width:100%}button{cursor:pointer;width:auto}input:focus-visible,select:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--primary-color,#1778b5);outline-offset:2px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.check{display:flex;align-items:center;gap:10px}.check input{width:18px;min-height:18px;height:18px}.hint{font-size:12px;color:var(--secondary-text-color,#5e7282);line-height:1.6;margin:8px 0 16px}.error{font-size:12px;color:var(--error-color,#b43030);line-height:1.5}.tools{display:flex;gap:10px;align-items:center;margin:10px 0 18px;flex-wrap:wrap}details{border-top:1px solid var(--divider-color,#ccd9e3);padding:4px 0}summary{cursor:pointer;min-height:44px;padding:12px 0;font-size:13px}.mapping{display:grid;grid-template-columns:120px 1fr;gap:8px}.mapping input[hidden]{display:none}.filter-entry{display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:8px;margin-bottom:18px}.filter-entry label{margin:0;grid-column:1}.filter-entry button{align-self:start;grid-column:2;grid-row:1/4}small{font-size:11px}.status{font-size:12px;color:var(--secondary-text-color,#5e7282)}@media(max-width:400px){.pair{grid-template-columns:1fr;gap:0}.mapping{grid-template-columns:100px 1fr}}
  `;
  class WaterPurifierCardEditor extends HTMLElement {
    constructor() {super();this.attachShadow({mode:'open'});this._devices = [];this._entries = [];this._ticket = 0;this._config = normalize({});this._i18n=createI18n(this._config);this._draftFilters = null;}
    setConfig(config) {const next = normalize(config,this._hass);if (JSON.stringify(next.filters) !== JSON.stringify(this._config.filters)) this._draftFilters = null;this._config = next;refreshI18n(this);this._render(false);}
    set hass(value) {
      const changed = this._hass?.connection !== value?.connection;this._hass = value;const localeChanged=refreshI18n(this);
      if (!this._rendered||localeChanged) this._render();
      if (changed && this.isConnected) this._load(true);
    }
    connectedCallback() {if (this._hass) this._load(true);}
    disconnectedCallback() {this._ticket++;}
    async _load(refresh = false) {
      if (!this._hass) return;
      const ticket = ++this._ticket;
      try {
        const data = await registries(this._hass,refresh);if (ticket !== this._ticket || !this.isConnected) return;
        this._devices = data.devices.filter(waterIdentifier);this._entries = data.entities;this._error = '';
      } catch(error) {if (ticket !== this._ticket) return;this._error = error?.key?error:new CardMessageError('Automatic discovery unavailable. Manual entity mappings still work.');}
      this._render();
    }
    _commit(config) {
      try {
        const next = normalize(config,this._hass);this._config = next;refreshI18n(this);this._error = '';
        this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:next},bubbles:true,composed:true}));
        return true;
      } catch(error) {this._error = error;const el = this.shadowRoot.querySelector('[data-error]');if (el) el.textContent = errorMessage(this._error,this._i18n);return false;}
    }
    _t(key,values){return this._i18n.t(key,values);}
    _mapping(key, label, group) {
      const t=this._i18n.html;
      const map = this._config[group] ?? {},value = map[key];
      return `<label>${esc(label)}<span class="mapping"><select data-mode="${key}" data-group="${group}" aria-label="${t('{name} mapping mode',{name:label})}"><option value="auto" ${value === undefined ? 'selected' : ''}>${t(group === 'stages' ? 'From filter list' : 'Automatic')}</option><option value="manual" ${typeof value === 'string' ? 'selected' : ''}>${t("Choose entity")}</option><option value="hide" ${value === null ? 'selected' : ''}>${t(group === 'stages' ? 'Not mapped' : 'Hide')}</option></select><input data-mapping="${key}" data-group="${group}" list="water-entities" placeholder="sensor.entity_id" value="${esc(value ?? '')}" aria-label="${t('{name} entity',{name:label})}" ${typeof value === 'string' ? '' : 'hidden'}></span></label>`;
    }
    _render(keepInput = true) {
      refreshI18n(this);const t=this._i18n.html;
      const expanded = [...this.shadowRoot.querySelectorAll('details')].map(el => el.open);
      const active = this.shadowRoot.activeElement;
      const focusAttributes = ['data-option','data-mode','data-mapping','data-filter-name','data-filter-entity','data-filter-stage','data-action','data-remove'];
      const focusAttribute = active && focusAttributes.find(key => active.hasAttribute(key));
      const focus = focusAttribute ? {attribute:focusAttribute,value:active.getAttribute(focusAttribute),group:active.dataset.group,
        text:active.value,start:active.selectionStart,end:active.selectionEnd} : null;
      this._rendered = true;const c = this._config;
      const ids = Object.keys(this._hass?.states ?? {}).filter(entityId).sort();
      const deviceOptions = this._devices.map(d => `<option value="${esc(d.id)}" ${d.id === c.device_id ? 'selected' : ''}>${esc(d.name_by_user || d.name || d.id)}</option>`).join('');
      const groups = [
        [this._t("Water quality & production"),['state','fault','feed_tds','product_tds','feed_temperature','product_temperature','flow','waste_flow','water_total','waste_total','recovery']],
        [this._t("Installed equipment & status"),['pump','inlet','flush','uv_enabled','uv','uv_status','pressure','leak']],
        [this._t("Filter reminder entities"),['filter_1','filter_2','filter_3','filter_4','filter_5','filter_6','filter_7','filter_8']],
        [this._t("Device diagnostics"),['outputs','uptime','production_hours','starts','faults','pump_voltage','pump_current','uv_voltage','uv_current']]
      ];
      const custom = this._draftFilters ?? c.filters;
      this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><h3>${t("Water Purifier Cards")}</h3><p class="hint">${t("Choose a WATER MQTT device or map entities manually. All three card sizes share the same entity settings and JavaScript resource.")}</p>
        <label>${t("Device")}<select data-option="device_id"><option value="">${t("Manual entity mapping")}</option>${c.device_id && !this._devices.some(d => d.id === c.device_id) ? `<option value="${esc(c.device_id)}" selected>${t('Saved device · {name}',{name:c.device_id})}</option>` : ''}${deviceOptions}</select></label>
        <div class="tools"><button data-action="refresh">${t("Refresh devices")}</button><span class="status">${t('WATER devices found: {count}',{count:this._i18n.number(this._devices.length,0)})}</span></div>
        <div class="pair"><label>${t("Title")}<input data-option="title" maxlength="100" value="${esc(c.title??'')}" placeholder="${t('Water purifier')}"></label><label>${t("Card layout")}<select data-option="layout"><option value="full" ${c.layout === 'full' ? 'selected' : ''}>${t("Large · Full water circuit")}</option><option value="small" ${c.layout === 'small' ? 'selected' : ''}>${t("Small · Device status")}</option><option value="medium" ${c.layout === 'medium' ? 'selected' : ''}>${t("Medium · Quality & history")}</option></select></label></div>
        <label>${t('Language')}<select data-option="language"><option value="auto" ${c.language==='auto'?'selected':''}>${t('Follow Home Assistant')}</option>${Object.entries(LANGUAGE_NAMES).map(([code,name])=>`<option value="${code}" ${c.language===code?'selected':''}>${esc(name)}</option>`).join('')}</select></label><p class="hint">${t('Language follows your Home Assistant profile unless you choose an override. Custom titles and filter names are kept as entered.')}</p>
        <label>${t("Device dashboard URL (optional)")}<input type="url" data-option="dashboard_url" value="${esc(c.dashboard_url ?? '')}" placeholder="http://192.0.2.1/ui/"></label>
        <label class="check"><input type="checkbox" data-option="animate" ${c.animate ? 'checked' : ''}>${t("Animate water paths (large card)")}</label>
        <label class="check"><input type="checkbox" data-option="show_history" ${c.show_history ? 'checked' : ''} ${c.layout==='small'?'disabled':''}>${t("Show recorded TDS history (medium / large)")}</label>
        <label>${t("TDS history window (hours)")}<input type="number" data-option="history_hours" min="1" max="24" step="1" value="${c.history_hours}" ${c.layout==='small'?'disabled':''}></label>
        <p class="hint">${t("The small card never requests history. The medium card's usage totals are cumulative and independent of the TDS chart's time range. Standby does not confirm that automatic operation is enabled.")}</p>
        <p class="error" data-error role="alert">${esc(errorMessage(this._error,this._i18n))}</p>
        <datalist id="water-entities">${ids.map(id => `<option value="${esc(id)}">${esc(this._hass.states[id].attributes?.friendly_name ?? id)}</option>`).join('')}</datalist>
        ${groups.map(([title,keys]) => `<details><summary>${esc(title)}</summary>${keys.map(key => this._mapping(key,fieldLabel(FIELD[key],this._i18n),'entities')).join('')}</details>`).join('')}
        <details><summary>${t("Physical filter → maintenance entity")}</summary><p class="hint">${t("The firmware supports eight reminder slots. Match them to your installed filter types. These explicit click mappings override the stage assignments below; they do not change the plumbing.")}</p>${Object.entries(STAGES).map(([key,v]) => this._mapping(key,v[0] + ' · ' + this._t(v[1]),'stages')).join('')}</details>
        <details><summary>${t("Filter names & circuit stages")}</summary><p class="hint">${t("Name your installed filters and assign their actual stages. If every entry has a stage, only those stage types appear in the circuit. Otherwise the five-stage reference circuit remains. An empty list hides reminders only.")}</p><label class="check"><input type="checkbox" data-option="custom_filters" ${custom !== undefined ? 'checked' : ''}>${t("Use a custom list")}</label>
        ${custom !== undefined ? `<div data-filter-list>${custom.map((f,i) => `<div class="filter-entry"><label>${t("Name")}<input data-filter-name="${i}" maxlength="60" value="${esc(f.name)}"></label><label>${t("Entity")}<input data-filter-entity="${i}" list="water-entities" value="${esc(f.entity)}" placeholder="sensor.filter_reminder"></label><label>${t("Circuit stage")}<select data-filter-stage="${i}"><option value="">${t("Not assigned")}</option>${Object.entries(STAGES).map(([key,v])=>`<option value="${key}" ${f.stage===key?'selected':''}>${v[0]}</option>`).join('')}</select></label><button data-remove="${i}" aria-label="${t('Remove filter {count}',{count:this._i18n.number(i+1,0)})}">×</button></div>`).join('')}</div><div class="tools"><button data-action="add-filter" ${custom.length >= 8 ? 'disabled' : ''}>${t("Add reminder")}</button><button data-action="save-filters">${t("Save reminder list")}</button></div>` : ''}</details>
        <p class="hint">${t("Unmapped optional items are omitted. A mapped entity that becomes unknown or unavailable stays visible. Only the large card includes a circuit. No card sends device commands.")}</p>`;
      this.shadowRoot.querySelector('[data-action=refresh]').onclick = () => this._load(true);
      this.shadowRoot.querySelectorAll('[data-option]').forEach(input => input.onchange = () => {
        const key = input.dataset.option,next = {...this._config};
        if (key === 'custom_filters') {this._draftFilters = input.checked ? (c.filters ?? []) : null;if (input.checked) next.filters = this._draftFilters;else delete next.filters;this._commit(next);this._render();return;}
        if ((key === 'device_id'||key==='title') && !input.value) delete next[key];
        else next[key] = ['animate','show_history'].includes(key) ? input.checked : key === 'history_hours' ? Number(input.value) : input.value;
        if(key==='layout')next.type='custom:'+Object.keys(CARD_LAYOUTS).find(tag=>CARD_LAYOUTS[tag]===next.layout);
        if(this._commit(next)&&['layout','language'].includes(key))this._render(false);
      });
      this.shadowRoot.querySelectorAll('[data-mode]').forEach(select => select.onchange = () => {
        const key = select.dataset.mode,group = select.dataset.group,input = this.shadowRoot.querySelector(`[data-mapping="${key}"][data-group="${group}"]`);
        input.hidden = select.value !== 'manual';
        if (select.value === 'manual') {input.focus();return;}
        const map = {...this._config[group]};if (select.value === 'hide') map[key] = null;else delete map[key];
        this._commit({...this._config,[group]:map});
      });
      this.shadowRoot.querySelectorAll('[data-mapping]').forEach(input => input.onchange = () => {
        const value = input.value.trim();input.setCustomValidity(entityId(value) ? '' : this._t("Choose a sensor, binary_sensor, switch or input helper entity."));
        if (!input.reportValidity()) return;
        const group = input.dataset.group;this._commit({...this._config,[group]:{...this._config[group],[input.dataset.mapping]:value}});
      });
      const readFilters = () => [...this.shadowRoot.querySelectorAll('[data-filter-name]')].map(input => {
        const stage=this.shadowRoot.querySelector(`[data-filter-stage="${input.dataset.filterName}"]`).value;
        return {name:input.value,entity:this.shadowRoot.querySelector(`[data-filter-entity="${input.dataset.filterName}"]`).value.trim(),...(stage?{stage}:{})};
      });
      this.shadowRoot.querySelector('[data-action=add-filter]')?.addEventListener('click',() => {this._draftFilters = [...readFilters(),{name:this._t("Filter reminder"),entity:''}];this._render();});
      this.shadowRoot.querySelector('[data-action=save-filters]')?.addEventListener('click',() => {if(this._commit({...this._config,filters:readFilters()})){this._draftFilters = null;this._render();}});
      this.shadowRoot.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => {this._draftFilters = readFilters().filter((_,i) => i !== Number(button.dataset.remove));this._render();});
      this.shadowRoot.querySelectorAll('[data-filter-name],[data-filter-entity],[data-filter-stage]').forEach(input => input.oninput = () => {this._draftFilters = readFilters();});
      this.shadowRoot.querySelectorAll('details').forEach((el,i) => {el.open = expanded[i] ?? false;});
      if (focus) {
        const next = [...this.shadowRoot.querySelectorAll('[' + focus.attribute + ']')].find(el => el.getAttribute(focus.attribute) === focus.value && el.dataset.group === focus.group);
        if (next && keepInput && focus.attribute === 'data-mapping') {next.hidden = false;const mode = this.shadowRoot.querySelector(`[data-mode="${focus.value}"][data-group="${focus.group}"]`);if (mode) mode.value = 'manual';}
        if (next && !next.hidden) {
          if (keepInput && typeof focus.text === 'string' && ['INPUT','SELECT'].includes(next.tagName)) next.value = focus.text;
          next.focus({preventScroll:true});
          if (typeof focus.start === 'number' && typeof next.setSelectionRange === 'function') next.setSelectionRange(focus.start,focus.end);
        }
      }
    }
  }
  class WaterPurifierStatusCard extends WaterPurifierCard {
    static getStubConfig(){return {type:'custom:'+STATUS_TAG,layout:'small',entities:{}};}
  }
  class WaterPurifierHistoryCard extends WaterPurifierCard {
    static getStubConfig(){return {type:'custom:'+HISTORY_TAG,layout:'medium',history_hours:6,entities:{}};}
  }
  if (!customElements.get(TAG)) customElements.define(TAG,WaterPurifierCard);
  if (!customElements.get(STATUS_TAG)) customElements.define(STATUS_TAG,WaterPurifierStatusCard);
  if (!customElements.get(HISTORY_TAG)) customElements.define(HISTORY_TAG,WaterPurifierHistoryCard);
  if (!customElements.get(TAG + '-editor')) customElements.define(TAG + '-editor',WaterPurifierCardEditor);
  window.customCards = window.customCards || [];
  const pickerI18n=createI18n();
  for(const [type,name,description] of [
    [TAG,'Water Purifier · Full','Large card with the water circuit, readings, history and filter care.'],
    [STATUS_TAG,'Water Purifier · Status','Small home card: operating state, product TDS and flow.'],
    [HISTORY_TAG,'Water Purifier · History','Medium card: water quality, recorded TDS trend, cumulative usage and filter reminders.']
  ])if(!window.customCards.some(card=>card.type===type))window.customCards.push({type,name:pickerI18n.t(name),description:pickerI18n.t(description),preview:true});
  // Informative only: no analytics, broker credentials or service calls. History uses HA's own API.
  console.info('%c WATER PURIFIER CARD %c v' + VERSION,'color:white;background:#1778b5;padding:3px 6px','color:#1778b5;padding:3px 6px');
})();
