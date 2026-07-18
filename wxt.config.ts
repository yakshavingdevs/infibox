import { defineConfig } from "wxt";

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: "Infibox",
    description: "The ultimate browser extension for developer productivity",
    permissions: ["contextMenus", "scripting", "storage"],
    omnibox: {
      keyword: "infi",
    },
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["css/content.css", "img/infibox-logo.svg"],
      },
    ],
  },
});
