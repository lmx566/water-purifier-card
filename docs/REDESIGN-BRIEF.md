# Card family brief — 0.3.0

> Historical design brief. The 0.4.0 multilingual candidate keeps this information hierarchy and adds eleven interface languages; the English-only direction below describes the original reference images. See the current README for language behavior.

The user selected two additional layouts and requested implementing them alongside the original full card. All three are registered from the same `water-purifier-card.js` resource, with one shared editor and entity-mapping contract. This brief describes the source implementation direction; execution acceptance remains outstanding.

## Small status card

- Type: `custom:water-purifier-status-card`, default `layout: small`; approximately 360 × 168 px at the design reference size.
- Reading order: reported operating state, product TDS, contextual product flow and UV command. Faults replace normal context with a readable cause. Offline and unknown values remain explicit.
- No circuit, lifetime totals or history fetching. A standby label reflects the reported idle phase and does not imply that automatic operation is armed.
- Read-only entry to relevant details, with no start/stop toggle. English, white surface, water-blue state accent, dark numerals and no logo.

## Medium cumulative-history card

- Type: `custom:water-purifier-history-card`, default `layout: medium`; approximately 480 × 300 px at the reference size.
- Product-TDS focus and feed comparison, a real Recorder TDS trend (six hours by default), then cumulative product/waste totals, commanded production time and starts.
- The cumulative row and chart have different scopes. Do not label the counters Today, Last 6h or Lifetime, or infer interval totals without a separate aggregation contract.
- No circuit or hardware pictures. A short maintenance summary prioritizes due or uncertain filter plans; disabled reminders remain disabled rather than healthy. Names are explicit configuration, not inferred slot positions.
- UV state is the output command, not lamp-health or optical verification. There is no UV-life entity to fabricate a maintenance estimate from.
- Missing history remains missing, unavailable samples create gaps, and absent counters remain unknown rather than zero. Faults are more prominent than ordinary maintenance reminders.

## Shared configuration and delivery

The original type defaults to `full`; the two new types default to `small` and `medium`. A layout can be selected in the shared editor, and legacy `compact` is accepted as `small`. Explicit history-window settings remain authoritative. All three use the same device/registry mapping, manual entity overrides, safe dashboard URL and filter names. One frontend resource update exposes all three cards; existing MQTT entities require no firmware reflash for this addition.

## Retained full-card direction — Concept 03 / 0.2.0

Approved direction: a white instrument card with an original precision schematic. The user rejected catalogue-style miniature product photos, glowing hoses, and a thick glass tray, then accepted the unified technical line-art direction. The final request removes the top-left brand mark.

- Product context: a Home Assistant card for monitoring one configured RO purifier. English UI, read-only entity inspection, no firmware control changes.
- Hierarchy: title/phase; large product TDS plus feed comparison and real history; aligned secondary readings; open water circuit; compact maintenance rail; optional diagnostics and device-dashboard link.
- Drawing: consistent ink outlines and restrained blue active flow; recognizable filter, solenoid, pump, membrane, and UV silhouettes. Three prefilters before RO; T33 and optional UV after RO on the product branch; concentrate valve on the other branch. No tank is implied by this direct-flow diagram.
- Layout: one continuous host surface with subtle separators. Main RO axis and symmetric rounded output branches on wide cards. A deliberate narrower arrangement keeps labels and click targets usable in HA columns.
- Data: actual HA state/history only in the runtime. Eight filter reminder slots, explicit names/stage associations, distinct not-fitted/reminder-disabled/unknown states, no fabricated life metrics. UV command does not establish optical effectiveness.
- Motion: phase-based blue flow only; reduced-motion support; no decorative hover movement or glass/glow animations.
- Asset strategy: inline SVG and CSS in the single runtime module. No network image hosting or ESP32 flash cost.

Implementation acceptance remains pending. The 0.1.0 browser fixture and screenshots must not be cited as validation of Concept 03 or the new history/filter/UV behavior. The user owns subsequent runtime checks under the project collaboration rules.
