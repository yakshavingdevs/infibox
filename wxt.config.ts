import { defineConfig } from "wxt";
import solidPlugin from "vite-plugin-solid";

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
        resources: ["img/infibox-logo.svg"],
      },
    ],
  },
  vite: () => ({
    plugins: [solidPlugin()],
  }),
});
