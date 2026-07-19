import { render } from "solid-js/web";
import { defineContentScript } from "wxt/sandbox";
import { createShadowRootUi } from "wxt/client";
import type { Command } from "../../src/types";
import { buildContextCommandMap } from "../../src/shared/commands";
import { defaultCommands } from "./commands";
import { initShadow, isShadowMounted, destroyShadow, getShadowHost } from "./shadow-context";
import { setAppToolCommand, setAppMode, setAppPrefill } from "./app-bridge";
import App from "./App";
import "./content.css";

const contextCommandMap = buildContextCommandMap(defaultCommands);

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
        e.stopPropagation();
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
