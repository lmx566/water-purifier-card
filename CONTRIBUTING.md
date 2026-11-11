# Contributing

Water Purifier Card is a small, dependency-free Home Assistant dashboard card. The runtime is the root `water-purifier-card.js` file; it is also the installable artifact. No npm installation, bundler, or build step is needed.

## Scope

Contributions should improve water-circuit visibility, configuration, accessibility, or compatibility. Keep the card read-only. Device commands need an explicit firmware contract and a separate design review; do not add direct MQTT, ESP32 HTTP polling, or service calls as a shortcut.

Do not convert an absent or invalid reading to zero, report a filter reminder as a life percentage, or infer a pump's physical state from an operating phase. A bound but unavailable status item must remain visible. Unconfigured optional status items may be omitted; the full diagram's fixed core components and filter stages remain visible without bindings.

## Changes

1. Explain the problem and include the affected card configuration with private names and identifiers removed.
2. Edit the JavaScript directly. Keep runtime resources in that file and avoid external fonts, libraries, trackers, or network requests.
3. Update examples and documentation when configuration or supported states change.
4. Record user-visible changes in the unreleased changelog.
5. Report which checks were actually performed. Never describe a source review or a static mockup as a Home Assistant test.

Use `textContent` or equivalent safe text rendering for entity names, units, and states. Keep keyboard activation, focus visibility, Home Assistant theme variables, reduced-motion support, and mobile readability intact.

## Translations

The single runtime file contains the English message catalog and the embedded locale dictionaries. Keep every supported locale aligned with the English messages; keep interpolation tokens such as `{count}` and `{name}` exactly intact. Use complete sentences rather than joining translated fragments, and preserve the difference between a controller command and physical sensor feedback.

Do not translate YAML keys, entity IDs, firmware state identifiers, units, user-entered titles or filter names. Unknown status identifiers must remain visible. New strings need card, editor, empty/error and accessibility coverage; translated HTML interpolation must use the existing escaping helpers. Do not add runtime fetches or an extra localization resource to install.

For translation corrections, include the language, current wording, proposed wording and context. Review long text in all three card sizes and the editor. State honestly whether you checked source only, a synthetic preview, or a real HA installation; translation coverage is not proof of native-speaker or runtime acceptance.

## Maintainer acceptance

Local frontend regression checks live in `tests/browser.cjs`. They use a development-only Playwright installation and synthetic HA data, with no runtime dependencies added to the card. See [frontend validation](docs/FRONTEND-VALIDATION.md) for commands, recorded results, and their limits. Do not describe these checks as real Home Assistant acceptance.

The manual acceptance checklist is in [HACS readiness](docs/HACS-READINESS.md). It covers real Home Assistant installation, editor round-trips, entity availability, multiple devices, mobile layouts, themes, and updates. The standalone preview is a design aid; it is not a replacement for those checks.

CI runs the official HACS action without ignored checks. Its result is separate from functional compatibility in Home Assistant. Do not weaken checks to obtain a green result.

## Source and license

Submit only code and artwork that can be distributed under the repository's MIT license. Describe the origin and license of any third-party material. Contributions are licensed under [MIT](LICENSE).
