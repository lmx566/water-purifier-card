# Changelog

## 0.4.0 — Unreleased

- Subsequent source-reviewed display adjustment: the small and medium cards' status areas now omit normal UV command text, keeping device status consistent across all three cards. Fault descriptions and the full card's separate UV details are retained. The recorded test suites predate this adjustment and have not been rerun for it.

Multilingual three-card candidate, validated locally in Chromium and WebKit with targeted manual Home Assistant checks. It remains unreleased; official HACS validation and HACS installation/update have not been performed. No firmware was changed, compiled or flashed for this card revision.

- Added eleven embedded interface locales: English, Simplified and Traditional Chinese, German, French, Spanish, Italian, Dutch, Brazilian Portuguese, Japanese and Korean.
- Added automatic HA language selection and a per-card language option in YAML and the shared visual editor. Translated card labels, state descriptions, history/empty/error messages, configuration guidance and accessibility text.
- Added regional number and history-time formatting based on HA preferences. Kept per-card language isolated so differently localized cards can coexist.
- Preserved user titles, custom filter names, entity IDs and unknown firmware identifiers. The three cards remain read-only and install from one dependency-free JavaScript file.
- Updated the synthetic preview's language/format controls, installation examples, translation contribution guidance and publication checklist.
- Fixed narrow medium-card title wrapping in French and Spanish, Italian circuit endpoint labels, and full-card overflow with long custom titles or large readings.
- Passed 24/24 functional, 33/33 multilingual and 36/36 responsive checks in each of Chromium 156.0.8078.4 and WebKit 26.5. Recorded reports and synthetic-preview captures for the tested resource are linked from the frontend validation document.
- Checked HA Core 2026.3.1 / Frontend 20260304.0 with automatic Chinese, discovery, live readings, real Recorder history, German/Japanese overrides, three picker entries, layout switching, saved medium-card configuration after reload and native entity details. Small/medium cards were saved; full was checked in HA's editor preview. Complete real-HA coverage, native-speaker review, physical mobile/app checks and official HACS validation remain outstanding.

## 0.3.0 — Unreleased

Three-card implementation candidate based on the user's selected small status and medium cumulative-history designs. Source review only: no build, syntax check, browser automation, real HA/HACS installation, publication, or device test was performed for this revision.

- Kept the original full water-circuit card and added separate small-status and medium-history entries in the HA card picker. All three are registered by the same `water-purifier-card.js` module.
- Added the `small` and `medium` layouts and retained `compact` as a compatibility alias for `small`. Shared device matching, entity mappings, filter names and visual editing remain available across the family.
- Small displays reported operating state, product TDS and contextual flow/UV information without requesting history. Standby does not assert that automatic operation is armed.
- Medium removes the circuit and displays product/feed TDS, a six-hour default Recorder trend, cumulative product/waste volume, accumulated production time, starts and a prioritized filter-reminder summary. UV command state sits with the operating status.
- Kept missing data, offline state, unknown/disabled reminders and history gaps distinct from normal readings. Cumulative usage is not relabeled as today's usage or the chart's time interval.
- Updated the synthetic preview and YAML examples for the three-card family. Generated concept images remain design references, not bundled runtime assets or browser-validation evidence.

## 0.2.0 — Unreleased

Local Concept 03 implementation candidate. Source/design review only: no build, syntax check, browser automation, HA/HACS installation, publication, or device test was performed for this revision.

- Removed the header brand mark and redesigned the card around product TDS, a real HA history trend, and aligned secondary measurements.
- Replaced the water-path artwork with original technical SVG silhouettes, thin blue flow, and rounded product/concentrate branches. Retained wide/narrow presentations and reduced-motion behavior.
- Added history window/display options and an optional controller-dashboard link. HA provides the history; the runtime does not fabricate chart data or poll the ESP32.
- Updated filter mappings to the current eight-slot MQTT contract and added optional explicit stage associations to custom filters. Reminder states remain distinct from remaining-life measurements.
- Added UV configuration/command/status sensor mappings without inferring lamp output from voltage or current.
- Updated installation and HACS documentation. The JavaScript remains a single dependency-free module, separate from the firmware.
- Kept earlier screenshots and browser evidence labeled as 0.1.0 history; they do not validate this redesign.

## 0.1.0 — Unreleased

Initial local implementation. No public release, HACS validation run, or Home Assistant acceptance result has been recorded yet.

- English water-purifier dashboard card with a water-circuit view.
- Full and compact layouts with Home Assistant theme support.
- Revised the full layout around product-water TDS, secondary feed-water TDS, and a continuous circuit surface. The main operating row contains flow, total, recovery, and product temperature; secondary readings and explanatory notes are folded into Device diagnostics.
- Added wide/narrow SVG circuit coordinates selected by a 430-pixel card-container breakpoint, so the complete circuit fits without horizontal scrolling even in a narrow desktop dashboard column.
- Replaced stacked filter reminder rows with a four-column grid, two columns on narrow cards, and a dynamic due-reminder summary.
- Entity configuration for quality, production, filter reminders, and optional peripherals.
- Read-only entity details and browser-side water animation.
- Single JavaScript module with no runtime dependencies or build step.
- HACS manifest, strict validation workflow, contributor guidance, and publication checklist.
- Reproducible local browser fixture in `tests/browser.cjs`; 17/17 checks passed in Chromium 156.0.8078.4 with Playwright 1.62.1 and Node v24.5.0. Card, demo, and test JavaScript syntax checks passed. These use mock Home Assistant data, not a real HA installation.
- Fixed stale registry-cache reuse when the card or visual editor is removed and reattached, discovered during the initial browser run.
- Added actual Chromium demo screenshots, including card-only desktop/mobile views, and a [frontend validation record](docs/FRONTEND-VALIDATION.md); real HA/HACS acceptance remains outstanding.
