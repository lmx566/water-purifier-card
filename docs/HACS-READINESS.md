# HACS readiness

The standalone source repository is [lmx566/water-purifier-card](https://github.com/lmx566/water-purifier-card). The HACS reference documentation was reviewed on **2026-11-08**. The **0.4.0 multilingual three-card candidate** has recorded local Chromium/WebKit results and targeted manual checks on Home Assistant Core 2026.3.1 / Frontend 20260304.0. The subsequent UV status text adjustment was source-reviewed without rerunning those suites. The [official HACS action passed 8/8 checks on 2026-11-11](https://github.com/lmx566/water-purifier-card/actions/runs/43011190220/attempts/2) for commit `ac9c5989e4872dc0e1d6d12c0faf0257abe607b9`; HACS installation/update, a full Release and default-catalog acceptance remain outstanding.

## Repository preparation

| Requirement | Prepared / observed | Remaining evidence |
| --- | --- | --- |
| Public GitHub repository | Standalone source at [lmx566/water-purifier-card](https://github.com/lmx566/water-purifier-card), with the runtime and `.github` at the root | Keep the repository public and unarchived |
| Metadata and Issues | Description, topics, Issues and archive-status checks passed in the 2026-11-11 official run | Maintain public metadata and enabled Issues |
| License | Standard MIT `LICENSE`; official license check passed on 2026-11-11 | Preserve the license |
| Dashboard artifact | One root `water-purifier-card.js` registers all three cards; no external runtime assets; manually installed in HA | Clean installation and installation/update through HACS |
| Manifest | Root `hacs.json` and its matching runtime filename passed the official validator on 2026-11-11 | Revalidate changes to the manifest or artifact |
| Documentation | Repository-specific manual/HACS instructions, language/configuration examples, MQTT contract and validation record | Cover the remaining compatibility matrix and record actual HACS installation/update |
| Localization | Eleven embedded locales; all three cards/editor exercised in Chromium and WebKit | Native-speaker review and complete real-HA language/formatting coverage |
| Screenshot | README embeds a 0.4.0 Chromium capture of all three cards using synthetic readings, labeled as preceding the UV status text adjustment | Retain clear synthetic-data/revision captions; exclude household screenshots and identifiers |
| Validation workflow | Official `hacs/action@main`, category `plugin`, no ignored checks; [8/8 passed](https://github.com/lmx566/water-purifier-card/actions/runs/43011190220/attempts/2) for `ac9c5989e4872dc0e1d6d12c0faf0257abe607b9` | Require a passing run for the final release revision |
| Release | Manual process documented | Reviewed full Release and HACS installation/update evidence |
| Default catalog | No submission made | Follow current upstream inclusion process after prerequisites pass |

The Dashboard category is named `plugin` internally. HACS expects the JavaScript artifact in the repository root or `dist`, with the matching repository name. Use `https://github.com/lmx566/water-purifier-card` as the custom repository URL. See [Dashboard requirements](https://hacs.xyz/docs/publish/plugin/), [general requirements](https://hacs.xyz/docs/publish/start/), and [default repository inclusion](https://hacs.xyz/docs/publish/include/).

A public repository that meets HACS's structure can be added manually as a **custom Dashboard repository**. That is separate from inclusion in the default catalog. Default inclusion requires, among other checks, an error-free official action without ignored checks, a full GitHub Release, a recognized open-source license, README images and public repository metadata. Only the owner or a major contributor should submit the default-list request. A local passing browser suite does not satisfy those GitHub/HACS steps.

## Evidence completed for this candidate

The [frontend validation record](FRONTEND-VALIDATION.md) links reports and captures for SHA-256 `6200771e9de834adc4a17e693007605bd34b25e567404ec21ab6ef10ebcf0d1b`. That hash identifies the tested artifact before the UV status text adjustment; the checklist below is evidence for that artifact, not a claim that the later revision was retested.

- [x] Chromium 156.0.8078.4: **24/24 functional, 33/33 multilingual, 36/36 responsive checks**.
- [x] WebKit 26.5: **24/24 functional, 33/33 multilingual, 36/36 responsive checks**.
- [x] All three card types, shared editor, synthetic discovery/manual mappings, lifecycle/reconnect, unknown/offline/fault states, filter and UV semantics, read-only links/details and escaped untrusted text.
- [x] All eleven language catalogs, live locale changes, per-card overrides, aliases/fallbacks, localized errors/ARIA, custom-name preservation and unsaved editor drafts.
- [x] Synthetic HA number formats, 12/24-hour time and local/server timezone behavior.
- [x] Entity-scoped history, gaps/errors, request deduplication, stale responses and no history requests for the small layout.
- [x] All locales/layouts at 280–900 px card widths, long titles, large values, light/dark captures and narrow preview/editor views; identified overflow issues corrected and rerun.
- [x] Manual HA installation: automatic Chinese, WATER discovery, live TDS/totals, real six-hour Recorder history, German/Japanese overrides, three picker entries, layout switching, five in-service reminder entries and correct native entity details.
- [x] Saved medium-card configuration and browser reload preserve the original custom title, automatic language, six-hour history and live data. Full-layout behavior was checked in HA's editor preview; small/medium cards are saved on the dashboard.
- [x] Local manifest/issue-template/workflow/example parsing and source review of the one-file install structure.

The automated suites above use synthetic HA data; the manual HA observations are a separate, narrower check. Browser WebKit coverage is not a physical Safari/iOS or HA Companion app result. No firmware compilation, flashing or device-control operation was performed for these card checks.

## Acceptance still required

- [ ] Install on a clean HA setup and verify all three separately saved cards with their shared editor; the current full-card HA check uses editor preview.
- [ ] Exercise every locale and regional preference in real HA; obtain native-speaker feedback on translated terminology and long instructions.
- [ ] Verify real MQTT expiry, reconnect, entity rename/disable handling and device isolation; synthetic coverage does not prove transport behavior.
- [ ] Check real HA history permissions, Recorder exclusions/retention, dashboard navigation and long-lived/background sessions.
- [ ] Check physical mobile/touch devices, Companion apps, screen readers and additional HA/browser versions.
- [ ] Verify installation/update from a public HACS custom Dashboard repository, including browser caching and saved configuration preservation.
- [x] Public description/topics, Issues, archive status and license checks passed in the [2026-11-11 official run](https://github.com/lmx566/water-purifier-card/actions/runs/43011190220/attempts/2).
- [x] Official HACS action passed 8/8 checks without ignored checks for `ac9c5989e4872dc0e1d6d12c0faf0257abe607b9`.
- [ ] Create a full Release only after the remaining release checks pass; confirm a successful official action for its exact revision.
- [ ] Submit the default-catalog request only after prerequisites are satisfied; do not describe custom installation or a local test as catalog acceptance.

## Historical evidence

The earlier **0.1.0** implementation passed **17/17** synthetic-HA checks in Chromium. That record and its screenshots remain under [frontend validation](FRONTEND-VALIDATION.md) as historical evidence. They do not validate 0.4.0; the current version has its own separate reports and captures.

## Submission

Keep the successful [official HACS action](https://hacs.xyz/docs/publish/action/) run, installation/update evidence and release link. Complete upstream requests truthfully; acceptance remains the maintainers' decision. See [release instructions](RELEASING.md). Public evidence should use synthetic captures or explicitly sanitized material and must not expose household addresses, identifiers, credentials or share paths.
