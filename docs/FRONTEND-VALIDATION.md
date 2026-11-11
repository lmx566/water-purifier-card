# Frontend validation

## Subsequent display adjustment — 2026-11-08

After the recorded 0.4.0 validation, the small and medium cards' status areas were changed to omit the normal UV command suffix, keeping device status consistent across all three cards. Fault descriptions and unavailable states still use the existing state resolver; the full card retains its separate UV details. This display change was source-reviewed; no tests were rerun. The hashes and passing results below identify the preceding tested artifact, not this later revision.

## 0.4.0 — 2026-11-08

**The final candidate passed the functional, multilingual and responsive suites in Chromium and WebKit.** These suites use synthetic Home Assistant registries, states and history. A separate manual installation in real Home Assistant is described below; it is not part of the synthetic test counts.

The user authorized testing the three HA cards and preparing publication after review. No ESP32 firmware was changed, compiled or flashed. No official HACS workflow, HACS installation/update, public repository publication, release or default-catalog submission was performed.

### Tested artifact and environment

- Card: `water-purifier-card.js`, version **0.4.0**, registering full, status and history cards.
- SHA-256: `6200771e9de834adc4a17e693007605bd34b25e567404ec21ab6ef10ebcf0d1b`.
- macOS, Node.js **24.5.0**, Playwright **1.62.1**.
- Chromium **156.0.8078.4** and WebKit **26.5**. Playwright WebKit is browser-engine coverage, not a physical iPhone, Safari app or HA Companion app test.
- Local fixtures serve the card over loopback, provide synthetic HA data, and reject non-local network attempts. No uncaught page errors, device-control service calls or external requests were observed in the exercised fixture scenarios.

| Engine | Functional | Multilingual | Responsive / containment |
| --- | --- | --- | --- |
| Chromium 156.0.8078.4 | [24/24](screenshots/v0.4.0/chromium-functional-results.json) | [33/33](screenshots/v0.4.0/i18n-results.json) | [36/36](screenshots/v0.4.0/chromium-visual-results.json) |
| WebKit 26.5 | [24/24](screenshots/v0.4.0/webkit-functional-results.json) | [33/33](screenshots/v0.4.0/i18n-webkit-results.json) | [36/36](screenshots/v0.4.0/webkit-visual-results.json) |

The reports identify the tested resource. These are local frontend results, not claims of HACS approval or complete Home Assistant compatibility.

### Coverage and repairs

- All three registered types, automatic device matching, exact registry identity, explicit/null mappings, ambiguous or disabled entities, delayed discovery, permission failures and retry.
- Producing, standby, flushing, fault, missing, unknown and disconnected states. Literal zero remains zero; invalid values do not become measurements. Filter reminder states and UV commanded output retain their distinct meanings.
- Read-only native more-info events, keyboard interaction and focus restoration; safe dashboard links; escaped names, units and unknown firmware identifiers.
- Shared editor round-trips, language/layout overrides, unsaved reminder drafts, incomplete manual mappings, focus, selection and expanded sections. User titles, filter names and entity IDs survive locale changes.
- Eleven catalogs with **257 messages each**, complete keys/interpolation tokens, all three cards and the editor, Chinese and Portuguese aliases, unsupported-profile fallback and invalid explicit-language rejection.
- HA number-format choices, 12/24-hour history labels, explicit server timezone and browser-local timezone. Per-card language does not change the user's numeric/time preferences.
- Entity-scoped, bounded read-only history requests; disabled history and the small layout make no history calls; pending requests deduplicate; stale responses cannot replace a new entity; missing records remain gaps. Removal and disconnection stop further history polling.
- All eleven locales and three layouts at **280, 320, 360, 390, 480, 680 and 900 px** card widths; long custom titles, unknown fault text and large counters; preview/editor at **320, 375 and 768 px**. Captures cover light/dark views and narrow card containers.

The responsive pass initially found cramped French/Spanish medium-card titles at 280 px, Italian circuit endpoint label overflow, and full-card overflow with long titles or large values. Those layouts were corrected, then the final responsive suite passed in both engines. Automated containment checks and inspected captures do not replace native-speaker review or physical mobile/app acceptance.

### Current runtime captures

These are real browser captures of the **synthetic preview**, not a household dashboard or measurements from a controller:

- [Three cards, Chromium](screenshots/v0.4.0/chromium-three-cards.png)
- [Three cards, WebKit](screenshots/v0.4.0/webkit-three-cards.png)
- [Chinese medium, Chromium](screenshots/v0.4.0/chromium-zh-Hans-medium-light.png)
- [German full at narrow width, Chromium](screenshots/v0.4.0/chromium-de-full-mobile.png)
- [German editor at narrow width, WebKit](screenshots/v0.4.0/webkit-de-editor-mobile.png)
- [Full dark view, Chromium](screenshots/v0.4.0/chromium-en-full-dark.png)

Only the root JavaScript file is installed as the HA resource. Tests, demo code and captures are development documentation.

### Manual Home Assistant installation

The candidate was copied into an existing HA installation's web-resource location and its single resource entry was updated from 0.3.0 to 0.4.0. The About screen reported **Home Assistant Core 2026.3.1** and **Frontend 20260304.0**. The browser was the existing **macOS Chrome** installation; its exact version was not recorded. The Chromium version in the local-suite table does not describe this manual session. The following behavior was directly observed in that installation:

- Small and medium cards automatically use Chinese and discover the configured WATER device.
- All three card types appear in HA's picker with Chinese names.
- Live TDS readings and cumulative totals display, and real HA Recorder history loads over the configured six-hour window.
- The existing medium card can switch between full, small and medium layouts in the shared editor. German and Japanese overrides apply immediately.
- The card was restored to its original medium layout, `language: auto`, six-hour history and explicit custom title `Water purifier`, then saved. After leaving edit mode and reloading the page, the Chinese interface, live readings, cumulative totals and six-hour Recorder graph remained correct. The small/medium cards' existing English custom titles were intentionally retained as user content, not treated as missing translations.
- The medium filter section expands to show five in-service reminder entries.
- The medium history button and full-layout TDS reading open the intended native HA entity details.

Small and medium cards were saved on the dashboard. The full card was exercised in HA's actual editor preview, not added as a separately saved dashboard card. These are targeted checks on one HA installation, not the complete compatibility matrix. No private address, MAC identifier, shared-folder path or household screenshot is included in this public record. HACS was not used for this installation; no device-control service was invoked.

### Reproduce the local suites

Use a development-only Playwright installation. The runtime card requires no npm installation or build step. Run from this repository's root, using a new output directory so retained evidence is not overwritten:

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium webkit
CARD_SCREENSHOTS=/tmp/water-card-review/chromium node tests/browser.cjs
CARD_I18N_REPORT=/tmp/water-card-review/chromium/i18n-results.json node tests/i18n.cjs
CARD_SCREENSHOTS=/tmp/water-card-review/chromium node tests/visual.cjs
CARD_BROWSER=webkit CARD_SCREENSHOTS=/tmp/water-card-review/webkit node tests/browser.cjs
CARD_BROWSER=webkit CARD_I18N_REPORT=/tmp/water-card-review/webkit/i18n-results.json node tests/i18n.cjs
CARD_BROWSER=webkit CARD_SCREENSHOTS=/tmp/water-card-review/webkit node tests/visual.cjs
```

The harnesses start and stop their own loopback servers. `CARD_BROWSER_PATH` may select an already installed browser executable; `NODE_PATH` may identify an existing development package directory. Firefox is supported by the launcher but has not been validated in this record.

### Remaining acceptance

Remaining work includes a clean HA installation, a separately saved full card, actual MQTT expiry/reconnect behavior, all locale/regional preferences in real HA, other HA/browser versions, physical touch devices and Companion apps, screen readers, and native-speaker review. Public GitHub metadata, the official HACS action, custom-repository installation/update and a complete Release remain outstanding. See [HACS readiness](HACS-READINESS.md).

---

# Historical frontend validation — 2026-10-28 / 0.1.0

> Historical evidence for the unreleased **0.1.0** candidate only. The results and screenshots below are retained for provenance; they do not validate the later three-card multilingual implementation. Current 0.4.0 evidence is recorded above.

**Result: 17 of 17 local browser checks passed after the layout redesign.** This validates the standalone card and its visual editor against synthetic Home Assistant objects. It does not establish compatibility with a real HA installation, MQTT transport, HACS installation/update, or HACS catalog acceptance.

The user authorized this card's frontend checks only. No firmware build, device test, release packaging, repository publication, or HACS submission was performed.

## Environment and method

- macOS, Node.js **24.5.0**.
- Playwright **1.62.1**, headless Chromium **156.0.8078.4**, using an explicit installed browser path.
- Card version: unreleased **0.1.0**.
- A temporary HTTP server bound to `127.0.0.1` served only the card, its demo fixture, and a module-loader fixture. It was stopped after the checks.
- All device, registry, and entity data were synthetic. Requests to other origins were blocked and recorded; none occurred.
- Syntax checks passed for `water-purifier-card.js`, `examples/demo.js`, and `tests/browser.cjs` using `node --check`.
- Desktop, narrow-phone, and dark screenshots were also visually inspected. Other browser engines, physical touch devices, screen readers, and native HA containers were not tested.

## Checks performed

The executable checks are in [`tests/browser.cjs`](../tests/browser.cjs). The [machine-readable result](screenshots/chromium-results.json) records every check and its outcome.

1. Custom-card registration, automatic discovery, and producing animation.
2. Idle and flushing behavior; a real zero stays zero and unknown recovery stays unknown.
3. Fault, unavailable, HA-disconnected, and missing-entity rendering; invalid readings do not become measurements.
4. Correct more-info event targets, keyboard component activation, and focus restoration after closing details.
5. Explicit hide overrides, compact/full layouts, animation toggle, and reduced-motion preference.
6. Visual editor changes with synchronous host `setConfig` feedback, manual mappings, custom reminder drafts, saving, removing, and returning to automatic reminders.
7. Document containment at **320, 375, and 768 px**, plus **1280 px** desktop and light/dark rendering. The circuit uses a separate narrow-card SVG arrangement. All nine interactive components fit within the visible figure; neither the figure nor the page requires horizontal scrolling.
8. Two-device isolation, exact registry matching, manual overrides, null overrides, disabled entries, and ambiguous matches.
9. A delayed discovery response cannot overwrite a newer manual configuration.
10. Registry permission failure preserves explicitly mapped readings and exposes retry.
11. WebSocket reconnect refreshes renamed entities; disconnect stops animation.
12. Card removal and reattachment refresh entities renamed while it was absent and release/recreate subscriptions.
13. Invalid numeric inputs, zero, optional unavailable entities, units, safe text rendering, and invalid-configuration rejection.
14. Editor removal and reattachment refresh device names changed while it was absent.
15. Loading through an actual `type="module"` resource and the public card/editor configuration and sizing interfaces.
16. No uncaught page errors or requests to external origins in the exercised paths.
17. Cards placed in 280/320/380/430/600 px dashboard columns respond to their own container width even in a 1280 px browser viewport, with exactly nine visible component targets and no card overflow.

The initial run reproduced one failure: the card reused its cached registry after reattachment and could continue pointing to an old entity ID. Both card and editor now request a fresh registry when attaching. That repair passed 16 checks, including regression cases for both lifecycles. The subsequent visual redesign retained these checks and added the desktop-container-width case; the final redesigned version passed all 17. SVG visibility and geometry assertions were updated for the deliberate replacement of horizontal scrolling with two complete responsive arrangements.

## Runtime demo captures

These are browser screenshots of `preview.html`, clearly marked **DEMO · EXAMPLE DATA**. They are not screenshots of a Home Assistant installation or measurements from a controller.

- [Card only, desktop](screenshots/chromium-card.png)
- [Card only, phone](screenshots/chromium-card-mobile.png)
- [Desktop, light](screenshots/chromium-desktop.png)
- [Phone viewport, 375 px](screenshots/chromium-mobile.png)
- [Desktop, dark](screenshots/chromium-dark.png)

The screenshots and test files are development documentation. HACS installs only the root JavaScript file.

## Historical reproduction notes

The following commands and launcher defaults describe the earlier 0.1.0 harness. Use the current reproduction section above for the expanded 0.4.0 suites.

Use Node.js and a development-only installation of Playwright with its Chromium browser. The card itself has no npm or runtime library requirement.

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
node --check water-purifier-card.js
node --check examples/demo.js
node --check tests/browser.cjs
node tests/browser.cjs
```

Run from this repository's root. The harness starts and stops its own loopback server. It never connects to a Home Assistant or controller address. Optional environment variables:

- `CARD_SCREENSHOTS`: directory for screenshots and the JSON report; omitted by default to avoid overwriting recorded evidence.
- `CARD_BROWSER_PATH`: explicit browser executable when using an existing installation.
- `CARD_BROWSER`: `chromium` by default. `webkit` and `firefox` are supported by the launcher but have not been validated in this record.
- `NODE_PATH`: an existing package directory if Playwright is provided by a local tool environment rather than installed into this repository.

## Historical remaining scope

At the time of the 0.1.0 record, real HA installation and configuration persistence, actual MQTT availability/expiry handling, HA more-info dialogs, dashboard navigation/background lifecycle, screen-reader acceptance, mobile app behavior, and HACS install/update must be verified separately. Complete the real-system checklist in [HACS readiness](HACS-READINESS.md), then run the official HACS workflow on the public repository before publishing a release or applying to the default catalog.
