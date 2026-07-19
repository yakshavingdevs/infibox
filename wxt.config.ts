import { defineConfig } from "wxt";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: "Infibox",
    description: "The ultimate browser extension for developer productivity",
    permissions: ["contextMenus", "scripting", "storage"],
    icons: {
      "16": "img/infibox-16.png",
      "48": "img/infibox-48.png",
      "128": "img/infibox-128.png",
    },
    action: {
      default_icon: {
        "16": "img/infibox-16.png",
        "32": "img/infibox-32.png",
      },
    },
    omnibox: {
      keyword: "infi",
    },
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["img/infibox-logo.svg"],
      },
    ],
  },
  vite: () => ({
    plugins: [solidPlugin()],
  }),
});
