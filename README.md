<div align="center">
  <a href="https://infibox.org">
  <img src="public/img/infibox-256.png" alt="Infibox Logo" height="128" />
  </a>

  <h3>Infibox</h3>
  <p>The ultimate browser extension for developer productivity</p>
  <a href="https://github.com/yakshavingdevs/infibox/blob/main/LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
  </a>
  <a href="https://github.com/yakshavingdevs/infibox/">
    <img alt="version" src="https://img.shields.io/badge/version-0.0.1-blue">
  </a><br><br>
</div>

## The Idea
Developers currently use various small utilities on various websites or use a tool like CyberChef which provides multiple utilities in one place. We wanted to walk along the same path of providing multiple utilities in one place but with a better user experience within the browser by providing a Cmd+K style command bar and also augment the context menu to provide similar utilities.

For now, we are only targeting Chrome but we intend to support other browsers in the future.

## Local Setup

### Prerequisites
1. You need to have Chrome (or any other Chromium based browser with extension support) installed

Note: There maybe minor compatibility issues with Non-Chrome Chromium based browsers, so we recommend Chrome.

2. You need to have Node.js/NPM available on your desktop.

### How to get it running
1. Pull the package to your local desktop
```
git clone https://github.com/yakshavingdevs/infibox.git
```

2. Install npm dependencies
```
npm i
```

3. Start the development server (with HMR)
```
npm run dev
```

4. Build the extension for production
```
npm run build
```

We use [WXT](https://wxt.dev) for building the extension. It handles bundling with Vite, generates the manifest, and provides HMR during development.

5. Open the extensions page in Chrome by visiting [chrome://extensions/](chrome://extensions/)

6. Click on the "Load unpacked" button and select the `.output/` directory (development) or `dist/` directory (production) to load your Chrome extension.

### Contributing

Development of Infibox happens in the open on GitHub. You can read the contributing guide here: [CONTRIBUTING.md](https://github.com/yakshavingdevs/infibox/blob/main/CONTRIBUTING.md).

### License

[MIT](https://github.com/yakshavingdevs/infibox/blob/main/LICENSE)
