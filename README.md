# ¿Cerré la puerta? 🚪

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A lightweight, privacy-first, open-source app that records **when you personally confirmed** a door was closed. Useful when you leave home and later wonder if you locked up.

**Language:** Spanish (`es-UY`) · **Stack:** HTML, CSS, modern JavaScript · **Dependencies:** none · **Storage:** browser `localStorage`.

> **Important:** This is a personal confirmation log, not a door sensor. It cannot know whether a door is currently open, closed, or locked. Always verify the physical door yourself before logging it. Do not use it as a security monitor.

## Features

- One-tap timestamped confirmations for any selected door.
- Multiple doors: add, rename, remove, and switch between them.
- Local confirmation history, with a filter for one specific door.
- Offline support after first load using a service worker.
- Browser-only data storage; no account, tracking, analytics, external database or server required.
- Responsive layout, accessible labels, and reduced-motion support.
- Built-in automated tests for the core data model.

## Getting started

You only need Node.js 18+ for the development server and automated tests. **The web app itself requires no npm dependencies.**

```bash
git clone https://github.com/MatisterUY/cerre-la-puerta.git
cd cerre-la-puerta
npm start
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

To run the tests:

```bash
npm test
```

Alternatively, serve the folder with any static HTTP server. Since the app uses JavaScript modules and a service worker, opening the HTML directly as a `file://` URL is not recommended.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. Open repository **Settings → Pages**.
3. In **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**.
4. Save and wait for the first deployment.

All app paths are relative, so it works under `https://matisteruy.github.io/cerre-la-puerta/`.

## Folder structure

```text
index.html           Main application
assets/styles.css    Responsive styles
assets/icon.svg      App icon
src/model.js         Testable data model and validation
src/app.js           UI behavior and local persistence
manifest.webmanifest Installable web app metadata
sw.js                Offline asset cache
scripts/serve.js     Simple zero-dependency local server
tests/model.test.js  Automated tests
```

## Privacy and data

Confirmation records stay in the browser's `localStorage`. They are not sent to the author or synced between devices. Data may be lost if the browser storage is cleared or unavailable (for example, in certain private browsing modes). Up to 20 doors and 500 history events are kept per browser. Removal of a door does **not** delete its historical entries; those are retained under the door name used at confirmation time.

The stylesheet references Google Fonts when online; system fonts are used as a fallback. No information from the app's local state is sent to Google Fonts.

## Contributing

Issues, bug reports, translations, and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Contributors should run `npm test` and verify keyboard navigation before submitting a pull request.

## License

MIT — see [LICENSE](LICENSE). Maintained by [MatisterUY](https://github.com/MatisterUY).
