import { render } from "solid-js/web";
import { defineContentScript } from "wxt/sandbox";
import { createShadowRootUi } from "wxt/client";
import type { Command } from "../../src/types";
import { defaultCommands } from "./commands";
import { initShadow, isShadowMounted, destroyShadow, getShadowHost } from "./shadow-context";
import { setAppToolCommand, setAppMode, setAppPrefill } from "./app-bridge";
import App from "./App";
import "./content.css";

const contextCommandMap: Record<string, string> = {
  "cmdk-base64-encode": "Base64 Tool > Base64 Encode",
  "cmdk-num-hex": "Number Tools > Decimal to Hex",
  "cmdk-num-dec": "Number Tools > Hex to Decimal",
  "cmdk-num-bin": "Number Tools > Decimal to Binary",
  "cmdk-num-decbin": "Number Tools > Binary to Decimal",
  "cmdk-json-parse": "JSON Tools > Parse JSON",
  "cmdk-json-string": "JSON Tools > Stringify JSON",
  "cmdk-hash": "Hash Tool",
  "cmdk-time-now": "Time Tools > Current Timestamp",
  "cmdk-time-fmt": "Time Tools > Format Timestamp",
  "cmdk-enc-urlenc": "Encode/Decode Tools > URL Encode",
  "cmdk-enc-urldec": "Encode/Decode Tools > URL Decode",
  "cmdk-enc-htmlesc": "Encode/Decode Tools > HTML Escape",
  "cmdk-enc-htmlunesc": "Encode/Decode Tools > HTML Unescape",
  "cmdk-str-rev": "String Tools > Reverse",
  "cmdk-str-sub": "String Tools > Substring",
  "cmdk-str-upper": "String Tools > Change Case > Uppercase",
  "cmdk-str-lower": "String Tools > Change Case > Lowercase",
  "cmdk-str-cap": "String Tools > Change Case > Capitalize",
  "cmdk-str-title": "String Tools > Change Case > Title Case",
  "cmdk-str-trim-full": "String Tools > Trim > Full",
  "cmdk-str-trim-left": "String Tools > Trim > Left",
  "cmdk-str-trim-right": "String Tools > Trim > Right",
  "cmdk-str-rmspaces": "String Tools > Remove Extra Spaces",
  "cmdk-str-wordcnt": "String Tools > Count > Word Count",
  "cmdk-str-charcnt": "String Tools > Count > Character Count",
  "cmdk-str-linecnt": "String Tools > Count > Line Count",
  "cmdk-str-sortlines": "String Tools > Lines > Sort Lines",
  "cmdk-str-revlines": "String Tools > Lines > Reverse Lines",
  "cmdk-str-shufllines": "String Tools > Lines > Shuffle Lines",
  "cmdk-str-rmdup": "String Tools > Lines > Remove Duplicates",
  "cmdk-str-rep": "String Tools > Replace",
  "cmdk-str-split": "String Tools > Split",
  "cmdk-str-join": "String Tools > Join",
  "cmdk-str-repeat": "String Tools > Repeat",
  "cmdk-str-pad-left": "String Tools > Pad > Left",
  "cmdk-str-pad-right": "String Tools > Pad > Right",
  "cmdk-str-extract-numbers": "String Tools > Extract > Numbers",
  "cmdk-str-extract-letters": "String Tools > Extract > Letters",
  "cmdk-str-extract-words": "String Tools > Extract > Words",
  "cmdk-hash-simple": "Hash Tools > Simple Hash",
  "cmdk-hash-fnv1a": "Hash Tools > FNV-1a",
  "cmdk-hash-djb2": "Hash Tools > djb2",
  "cmdk-hash-sdbm": "Hash Tools > sdbm",
  "cmdk-hash-murmur": "Hash Tools > Murmur3-like",
  "cmdk-todo": "To-Do",
};

function searchCommandByPath(path: string, list: Command[]): Command | null {
  const parts = path.split(">").map((s) => s.trim().toLowerCase());
  let currentList = list;
  let found: Command | null = null;
  for (const part of parts) {
    found = currentList.find((cmd) => cmd?.name?.toLowerCase() === part) ?? null;
    if (!found) return null;
    currentList = found.children || [];
  }
  return found;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    async function ensureShadow(): Promise<void> {
      if (isShadowMounted()) return;
      const ui = await createShadowRootUi(ctx, {
        name: "infibox-cmdk",
        position: "inline",
        anchor: "html",
        onMount: (container, shadowRoot, wrapper) => {
          container.id = "cmdk-overlay";
          container.className = "cmdk-overlay";

          container.addEventListener("click", (e) => {
            if (e.target === container) destroyShadow();
          });

          initShadow(shadowRoot, wrapper as HTMLElement, () => ui.remove());
          render(() => <App />, container);
          container.classList.add("open");
        },
      });
      ui.mount();
    }

    function applyColor(color: string) {
      if (isShadowMounted()) {
        try { getShadowHost().style.setProperty("--primary", color); } catch {}
      }
    }

    chrome.storage.local.get({ primaryColor: "#000000" }, (settings: Record<string, unknown>) => {
      applyColor(settings.primaryColor as string);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && "primaryColor" in changes) {
        applyColor(changes.primaryColor.newValue as string);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isShadowMounted()) {
          destroyShadow();
        } else {
          ensureShadow();
        }
      }
    });

    chrome.runtime.onMessage.addListener((request: Record<string, unknown>) => {
      if (!request.action || !request.selection) return;
      const sel = request.selection as string;

      if (request.action === "cmdk-todo") {
        chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
          const tasks = (result.cmdkTodoTasks || []) as { text: string; completed: boolean }[];
          tasks.push({ text: sel, completed: false });
          chrome.storage.local.set({ cmdkTodoTasks: tasks });
          alert("Saved to To-Do");
        });
        return;
      }

      const desiredPath = contextCommandMap[request.action as string];
      if (!desiredPath) return;
      const cmd = searchCommandByPath(desiredPath, defaultCommands);
      if (!cmd) return;

      if (cmd.requiresInput) {
        setAppToolCommand(cmd);
        setAppPrefill(sel);
        setAppMode("tool");
        if (!isShadowMounted()) {
          ensureShadow();
        }
      } else if (cmd.action) {
        if (!isShadowMounted()) {
          ensureShadow().then(() => cmd.action!());
        } else {
          cmd.action();
        }
      }
    });
  },
});
