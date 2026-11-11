# Design implementation notes — 0.3.0

> The visual references below describe the 0.3.0 design. The 0.4.0 source adds eleven interface languages and regional formatting without replacing these concept images. Their English labels are historical design examples, not a language limitation of the current card. Current runtime screenshots and layout acceptance remain pending.

The card family contains three read-only views, registered from one module: the original full `water-purifier-card`, the small `water-purifier-status-card`, and the medium `water-purifier-history-card`. The latter two implement the user's selected small status and medium cumulative-history concepts. All use a common editor, device mapping and configuration model. They are source implementation candidates, not runtime-validated layouts.

The full layout retains approved Concept 03: a white appliance instrument card with a precise line-drawn water path. The header contains the device title and reported phase, with no top-left brand mark. Its primary action is checking product TDS, then inspecting a component or a maintenance reminder.

## Visual system

Use HA's surface, text, divider, and font tokens with a water-blue accent. Large tabular product TDS provides the main visual anchor; feed TDS supplies context. Secondary flow, temperature, and cumulative-volume readings align their values and units. A small real-history graph sits with the quality information rather than becoming a separate dashboard panel.

The small layout uses one state-led composition: a readable operating phase, one product-TDS value, and a subordinate flow/UV line. It has no circuit, totals or Recorder requests. Its target size is about 360 × 168 px, with content allowed to grow rather than clip. A reported idle phase becomes standby without claiming that automatic operation is armed; that property is not available as a discovered entity in the current contract.

The medium layout targets about 480 × 300 px. It pairs product/feed TDS with a six-hour default history graph, then displays four cumulative counters and a prioritized maintenance summary. The counter row is explicitly cumulative and independent of the chart period. UV command is secondary header information. There is no circuit in the medium layout. Due or uncertain maintenance items take priority over neutral plan summaries, and controller faults take priority over routine maintenance.

The diagram uses consistent graphite outlines, white surfaces, restrained internal patterns, and thin blue water paths. PP, UDF, and CTO remain recognizable cylinders; the valve, pump, horizontal RO, T33, and UV use the same original SVG language. There are no photos, product logos, glossy pipes, thick glass frames, or downloadable assets. RO sits on the main axis, with rounded product/concentrate branches separated symmetrically in the wide layout. The narrow layout intentionally rearranges the circuit for legible component targets.

Filter reminders form a continuous rail rather than a set of equal-weight cards. Amber and fault colors are reserved for actual reported attention states. Reminder enums are never turned into fabricated percentages or days remaining. Extra readings and diagnostic explanations belong in the collapsible details area.

## Data and configuration

The design runs entirely in the browser. HA supplies current entity states and product TDS history. Empty history remains empty; preview data is confined to the separate demo. Current firmware publishes up to eight filter reminder slots and three UV sensor states, but does not publish its full filter catalog over MQTT. Physical names and stage associations therefore require explicit card configuration.

The default schematic illustrates five stage types. A nonempty custom filter list with every entry explicitly tagged by stage selects the represented stage types; it is not an arbitrary plumbing editor. Existing `stages` mappings remain click targets only. UV is shown according to its mapped configuration/status rather than inferred from current. See [MQTT contract](MQTT-CONTRACT.md) for the precise boundaries.

## Interaction and motion

Readings and component targets open HA more-info. An optional dashboard URL opens the controller's page. No start, stop, flush, lamp toggle, or reset command is added. Flow animation indicates reported operating phase, stops for invalid/disconnected/fault state, and respects reduced motion. Unknown data must remain visibly different from an off command.

## Review and remaining work

This revision has received source/design review only. No browser rendering, test, build, real HA installation, HACS validation, or device operation has been run. The existing screenshots describe 0.1.0 and are not proof of this design. Remaining acceptance includes the three picker entries from one resource, narrow cards, long labels/units, theme contrast, keyboard and assistive technology, lifecycle and history errors, and real HA/HACS install/update. The existing `compact` setting is accepted as a legacy alias for `small`; `full` remains the original type's default.

## Selected concept references — 2026-11-03

The user selected the small status-card direction and medium v3, then requested implementing both alongside the original full card. These generated images document the selected visual direction; they are not runtime screenshots or bundled UI assets. The 0.3.0 source implementation supplies the three card types in one file.

| Variant | Intended CSS size | Review status | Concept |
| --- | --- | --- | --- |
| Small status card | About 360 × 168 px | Selected; source implementation added in 0.3.0 | [Running, standby and fault states](concepts/status-small-v1-approved.png) |
| Medium quality card v3 | About 480 × 300 px | Selected; source implementation added in 0.3.0 | [Quality, cumulative history and maintenance](concepts/quality-medium-v3-history.png) |
| Medium quality card v2 | About 480 × 300 px | Archived: user requested history in place of the flow area | [Quality, efficiency and maintenance](concepts/quality-medium-v2-no-circuit.png) |
| Medium quality card v1 | About 480 × 300 px | Archived: user requested removing the circuit | [Earlier quality and process overview](concepts/quality-medium-v1-proposal.png) |

Both retain a white surface, dark data text, water-blue activity accents, restrained corners, English labels and no brand mark. The small card prioritizes operating state, one product-TDS reading, and a short flow/UV line; faults replace the auxiliary information with a specific cause. The latest medium proposal adds feed TDS, six hours of product-TDS history, cumulative usage counters and an actionable filter-reminder summary. UV output state appears beside the operating phase in the header. The user requested removal of the medium card's schematic and then replacing the flow area with historical data; v3 contains no pipe or component drawing. Each is intended as a read-only detail entry point, not a home-page start/stop control.

The medium maintenance example uses the explicitly configured name PP sediment and a reported due reminder. Actual filter names must follow explicit configuration rather than be inferred from slot numbers. The existing contract supports due, within-limits, reminder-disabled, missing-installation, calendar-unknown, not-fitted and unknown states; it provides neither remaining days/percentages nor a near-due state. It also does not publish UV lifetime/reminder entities, so the concepts show UV output state rather than UV maintenance. When no reminder is due, the summary must still distinguish unknown or disabled reminders from evaluated plans within their limits. Controller faults take priority over routine maintenance information.

The v3 usage section is explicitly labeled Cumulative: Product total maps to product_water_total, Waste total to waste_water_total, Production time to production_hours, and Starts to starts. Production time is accumulated commanded production duration, not board uptime or independently measured flow duration. These four counters are not restricted to the chart's Last 6h window and must not be presented as Today or Lifetime. Day/week/month summaries would require separate period aggregation and data-coverage handling. In the archived v2, RO recovery is the reported water-flow ratio, not TDS rejection or filter life. UV on means an output command, not verified UV intensity or disinfection.

All numbers, history and faults shown in these images are illustrative. Runtime history must come from HA Recorder, with gaps and missing history preserved. Retained readings must be labeled as such; disconnected/unavailable current readings must not be presented as live. Fault and offline handling must remain meaningful even without color or animation.

Generated with the built-in image generation tool. The approved small image is archived without alteration; medium v1 uses it as a visual-system reference, v2 removes the circuit, and v3 replaces live-flow metrics with cumulative usage. Exact prompts: [medium v1](concepts/quality-medium-v1.prompt.txt), [medium v2](concepts/quality-medium-v2.prompt.txt), [medium v3](concepts/quality-medium-v3.prompt.txt). The preceding concept work changed no runtime code. The subsequent 0.3.0 implementation changes the HA frontend only; no firmware, tests, build, packaging or device operations were run.
