# Publishing and releasing

The standalone source repository is [lmx566/water-purifier-card](https://github.com/lmx566/water-purifier-card). Its root contains the single runtime artifact, `water-purifier-card.js`, together with the HACS manifest, documentation and development fixtures. These instructions describe maintainer work; they are not a record of a completed release or HACS approval.

The **0.4.0** candidate has [local Chromium/WebKit results and targeted manual HA evidence](FRONTEND-VALIDATION.md), together with synthetic-preview screenshots in the README. The subsequent UV status text adjustment was source-reviewed without rerunning those tests. Source publication does not establish a versioned Release, successful official HACS validation, verified HACS installation/update, or default-catalog acceptance. Keep private HA addresses, identifiers, shared-folder paths and household screenshots out of public release evidence.

## Source publication and maintenance

1. Review the card, artwork, license, README, and [readiness checklist](HACS-READINESS.md).
2. Keep this standalone directory's contents, including `.github`, at the root of `lmx566/water-purifier-card`. Do not upload firmware credentials or the whole Water workspace.
3. Set the repository description and topics, enable Issues, and push the reviewed source. There is no build step and no release archive to generate.
4. Keep README installation links pointed at [this repository](https://github.com/lmx566/water-purifier-card). Link published release notes and validation results only when those artifacts exist.
5. The existing **HACS validation** workflow runs on pushes and pull requests; review its result for the exact source revision. Fix errors without adding `ignore`. The workflow only validates; it does not publish anything. The workflow file alone is not evidence of a successful run.
6. Complete the remaining real Home Assistant acceptance and record the results. The README uses browser captures of synthetic data, not household screenshots, and identifies the screenshot's older UV status text. Preserve the distinction between historical test results and later source-only changes.

Suggested repository description: “Read-only Home Assistant cards for water purifiers: live quality, water circuit, filter reminders and history, in 11 languages.” Suggested topics: `home-assistant`, `lovelace`, `hacs`, `dashboard`, `water-purifier`, `mqtt`. Enable Issues and keep the repository public and unarchived.

## A release

1. Choose a semantic version; the current source candidate is `0.4.0`. Keep the card's version marker, release tag, and changelog consistent. Source publication by itself is not a versioned release.
2. Change the changelog's unreleased entry to the actual release date and include compatibility results and known limitations.
3. Push that final revision and wait for HACS validation to succeed. Confirm the successful run corresponds to the revision being released.
4. In GitHub, create a **full Release** with a tag such as `v0.4.0` at that revision. A tag alone is insufficient for default-catalog submission. Attach the exact, reviewed `water-purifier-card.js` from that revision; it contains all three card types, and no minification or bundling is needed.
5. Confirm HACS can install the release as a custom Dashboard repository and the resource URL works. One resource must register full, status and history cards; do not create separate resources for them.

Release creation is deliberately manual. There is no workflow with write permissions or automatic tagging, publishing, or upload.

## HACS default catalog

Only after the release and checks are complete, the owner or a major contributor can open the default-catalog request. Follow the current upstream template and add the repository to the alphabetical `plugin` list. Review [HACS's inclusion instructions](https://hacs.xyz/docs/publish/include/) at submission time because rules can change. Do not advertise “HACS default” until accepted.

The source artifact follows the [single-file Dashboard structure](https://hacs.xyz/docs/publish/plugin/); version distribution follows [HACS release behavior](https://hacs.xyz/docs/publish/start/).
