# Source review — current and historical

## Standalone source publication — 2026-11-11

Repository: [lmx566/water-purifier-card](https://github.com/lmx566/water-purifier-card). The public source contains only the standalone HA cards, examples, documentation and development fixtures. Publication preparation updates installation links and documentation; it does not change the runtime JavaScript or ESP32 firmware, rerun tests, create a versioned Release, or establish HACS approval.

The latest runtime adjustment removes the normal UV command suffix from the small and medium cards' status areas. UV fault descriptions and the full card's separate UV details remain available. This adjustment was source-reviewed, not rerun through the recorded suites below. README screenshots are synthetic browser captures from before that adjustment and are labeled accordingly. HACS installation/update and default-catalog acceptance remain outstanding; a successful official HACS result has not been recorded here.

## 0.4.0 multilingual source review — 2026-11-08

Scope is the standalone HA frontend directory. This revision adds eleven embedded language catalogs to the same JavaScript resource: English, Simplified Chinese, Traditional Chinese, German, French, Spanish, Italian, Dutch, Brazilian Portuguese, Japanese and Korean. The ESP32 firmware, MQTT payloads and device Web interface are outside this change.

Source inspection covers per-card language selection, HA language changes after mounting, shared visual editor labels and validation, status/error text, automatically generated titles and filter labels, SVG/ARIA text, history chart labels, and preview configuration. An explicit title, filter name, entity ID or unit is retained. Unknown device status identifiers remain visible instead of being guessed or classified as normal. Translated text and interpolated values are escaped before insertion into HTML or SVG.

Each card/editor owns its language context; a card-level override does not change other cards or the HA user's number and time preferences. Numbers use HA's locale/number-format setting; history labels use its time-format and local/server timezone setting. SVG path coordinates and API timestamps remain machine-readable. Locale refresh rebuilds text-bearing markup while editor code retains filter drafts, expanded groups and focus. Registry errors retain message identifiers for translation at render time. Missing translations fall back to English.

The synthetic preview exposes language, number-format, time-format and timezone controls. These controls were subsequently exercised in the authorized browser checks recorded below. Card-picker metadata is initialized using the browser language because the global `customCards` registration does not receive an HA instance. Mounted cards and their editors follow HA, or their configured override.

Each catalog contains 257 messages. Follow-up source review corrected singular one-hour labels, explicit 24-hour midnight formatting (`h23`), unsaved filter-list draft handling during language changes, and Dutch wording that must distinguish “no reminders due” from “reminders disabled.”

The user subsequently authorized testing all three HA cards without changing the firmware. On the final resource SHA-256 `6200771e9de834adc4a17e693007605bd34b25e567404ec21ab6ef10ebcf0d1b`, Chromium 156.0.8078.4 and WebKit 26.5 each passed **24/24 functional, 33/33 multilingual and 36/36 responsive checks**. The responsive pass covers all eleven locales, all three layouts and 280–900 px card widths, plus long titles, large counters and narrow preview/editor viewports. Follow-up fixes address French/Spanish medium-card titles at 280 px, Italian circuit endpoint labels and long-title/large-value full-card overflow.

Manual checks on Home Assistant Core 2026.3.1 / Frontend 20260304.0 confirmed automatic Chinese, three picker entries, device discovery, live readings, six-hour Recorder history, German/Japanese overrides, layout changes, five in-service reminder entries and native entity details. A medium-card save and reload preserved its original custom title, automatic language and history setting. Small and medium cards are saved on the dashboard; the full layout was checked in the real HA editor preview. Public documentation uses only synthetic captures; private home addresses, identifiers and full-screen HA screenshots are excluded. See [frontend validation](FRONTEND-VALIDATION.md) for the execution record and its limits.

**At the time of this 2026-11-08 review**, the candidate had not been publicly published, run through the official HACS action, installed/updated through HACS or accepted into its default catalog. Firmware compilation/flashing and device-control operations were outside this card task. Passing browser assertions is not native-speaker review, physical mobile/app acceptance or complete real-HA compatibility; those remain in [HACS readiness](HACS-READINESS.md).

## 0.3.0 three-card source review — 2026-11-03

Scope is the standalone HA frontend directory: the shared runtime module, common editor, synthetic preview, YAML examples and documentation. The ESP32 firmware and device were not changed or exercised for this addition.

The revision adds small-status and medium-history card types while retaining the original full card. Review focuses on shared configuration/defaults, the `compact` compatibility alias, distinct state/fault/unavailable semantics, no history requests for small, real Recorder history for medium/full, and cumulative-counter labels that do not imply a daily or six-hour interval. Filter names remain explicit; disabled and unknown reminders must not be described as normal plans. No discovered `armed` entity is assumed from an idle phase.

One `water-purifier-card.js?v=0.3.0` resource registers the three types. Generated images in `docs/concepts` are visual references, not screenshots of this runtime. The preview supplies its own example data; runtime code must not substitute those values when readings are missing.

Corrections made during this source review:

- Clear an interrupted history request's loading/throttle state when the card detaches, so reattaching can request history immediately.
- Distinguish unavailable controller data from an actual HA connection loss in the medium card's filter summary.
- Label UV output as commanded on/off, rather than implying physical or optical verification.
- Honor explicit `product_tds: null` in the two new layouts, validate card types against own mapping keys, and include the small card's current state/readout in its accessible button label.

**No syntax check, automated test, browser rendering, build, real HA/HACS installation, packaging, publication, or device operation was run for 0.3.0.** Source review is not execution acceptance. The checklist in [HACS readiness](HACS-READINESS.md) remains outstanding, including picker/editor registration and all three layouts in real HA.

## Historical source review — 2026-10-28 / 0.1.0

Scope: the new standalone card directory only. The ESP32 firmware, MQTT service, embedded Web interface and existing Home Assistant YAML were not changed by this card task.

Reviewed the single-file card, native visual editor, registry mapping, preview fixture and repository documents. The source-inspection findings below are separate from the subsequently authorized frontend execution results.

Corrections made during review:

- Clear the discovery-loading state when switching from a device selection to manual mappings; discard stale asynchronous responses after a configuration change or disconnect.
- Listen for Home Assistant WebSocket ready/disconnected events and reload the registry after reconnect, including entity renames missed while offline. Remove listeners and subscriptions when detached.
- Connect the concentrate branch to the RO membrane's dedicated outlet, not its feed line.
- Preserve expanded editor sections, focus, text selection and unsaved custom-reminder drafts across relevant rerenders.
- Match the current 24-entity WATER MQTT contract, including real product/waste flow and totals. Do not expose nonexistent command/mask/CPU entities or infer component position from a command phase.
- Preserve unavailable/missing mapped items; use null only as an explicit mapping override, not an unavailable-data heuristic.
- Keep example data in separate, visibly labeled preview files. The HACS artifact contains no simulated readings.

Independent follow-up source review found no additional startup-level issue in the reviewed paths. Source inspection alone did not establish runtime behavior.

## Historical authorized frontend validation — 0.1.0

The user then authorized validation of the card only. Syntax checks passed for the card, demo, and browser test JavaScript. In Chromium 156.0.8078.4 with Playwright 1.62.1 and Node v24.5.0, the first synthetic-fixture browser run passed 13/14 checks and reproduced stale registry caching after a card was removed and reattached. The card and editor were corrected to refresh registry data when remounted. The expanded final suite, including editor remount and module loading, passed **16/16** checks.

The fixture also exercises state transitions, invalid/missing readings, multi-device mapping, override/null behavior, asynchronous and permission failures, reconnect/rename handling, editor round-trips, keyboard/more-info interactions, reduced motion, and responsive light/dark layouts. No uncaught browser error or external request was observed in the checked scenarios. Full evidence and reproduction instructions are in [frontend validation](FRONTEND-VALIDATION.md).

This result is local browser evidence using mock HA registries and states. It does not establish real Home Assistant installation, HACS validation, ESP32 behavior, or upstream acceptance. No firmware build, device test, or publishing action was performed. The real-environment checklist in [HACS readiness](HACS-READINESS.md) remains unchecked.

## Historical visual redesign follow-up — 0.1.0

After the user rejected the initial visual presentation, the card was restructured around a primary product-TDS reading and an unbroken white water-circuit area. Secondary readings moved into diagnostics; reminder rows became a responsive grid. Two SVG arrangements now keep the entire circuit visible at narrow card widths. The standalone test suite was updated to check visible component geometry and container-based responsiveness, and the redesigned version passed **17/17**. Desktop and phone renders were visually inspected; the RO label/branch spacing and small-screen labels were corrected. Screenshots in this directory now show this redesign.
