import type { ContextMenuItem } from "../src/types/index";
import { defineBackground } from "wxt/sandbox";
import { allUtilityCommands, buildContextMenuItems } from "../src/commands";
import { STORAGE_KEYS, DEFAULTS } from "../src/constants";

export default defineBackground(() => {
  const CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
    ...buildContextMenuItems(allUtilityCommands),
    {
      id: "cmdk-todo",
      title: "Save to To-Do",
      contexts: ["selection", "link"],
    },
  ];

  function createContextMenuItem(item: ContextMenuItem, parentId: string | null = null): void {
    const config: Record<string, unknown> = {
      id: item.id,
      title: item.title,
      contexts: item.contexts,
    };
    if (parentId) config.parentId = parentId;

    try {
      chrome.contextMenus.create(config as chrome.contextMenus.CreateProperties);
      if (item.children) {
        item.children.forEach((child) => createContextMenuItem(child, item.id));
      }
    } catch (error) {
      console.error(`Failed to create context menu '${item.id}':`, error);
    }
  }

  function removeContextMenus(): void {
    chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) {
        console.error(
          "Failed to remove context menus:",
          chrome.runtime.lastError
        );
      }
    });
  }

  function updateContextMenus(enabled: boolean): void {
    removeContextMenus();
    if (enabled) {
      CONTEXT_MENU_ITEMS.forEach((item) => createContextMenuItem(item));
    }
  }

  function applySettings(): void {
    chrome.storage.local.get(
      { [STORAGE_KEYS.ENABLE_CONTEXT_MENUS]: DEFAULTS.ENABLE_CONTEXT_MENUS },
      (settings: Record<string, unknown>) => {
        updateContextMenus(settings[STORAGE_KEYS.ENABLE_CONTEXT_MENUS] as boolean);
      },
    );
  }

  chrome.runtime.onStartup.addListener(applySettings);
  chrome.runtime.onInstalled.addListener(applySettings);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && STORAGE_KEYS.ENABLE_CONTEXT_MENUS in changes) {
      updateContextMenus(changes[STORAGE_KEYS.ENABLE_CONTEXT_MENUS].newValue as boolean);
    }
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) {
      console.error("No valid tab ID found for context menu click:", info);
      return;
    }

    const message = {
      action: info.menuItemId,
      selection: info.selectionText || info.linkUrl,
    };

    chrome.tabs.sendMessage(tab.id, message, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to send message to tab:", chrome.runtime.lastError);
      }
    });
  });
});
