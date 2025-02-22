const CONTEXT_MENU_ITEMS = [
  {
      id: "cmdk-base64-encode",
      title: "Base64 Encode",
      contexts: ["selection"],
  },
  {
      id: "cmdk-trim",
      title: "Trim",
      contexts: ["selection"],
      children: [
          {
              id: "cmdk-trim-full",
              title: "Full Trim",
              contexts: ["selection"],
          },
          {
              id: "cmdk-trim-left",
              title: "Trim Left",
              contexts: ["selection"],
          },
          {
              id: "cmdk-trim-right",
              title: "Trim Right",
              contexts: ["selection"],
          },
      ],
  },
  {
      id: "cmdk-save-link",
      title: "Save Link to To-Do",
      contexts: ["link"],
  },
];

function createContextMenuItem(item, parentId = null) {
  const config = {
      id: item.id,
      title: item.title,
      contexts: item.contexts,
  };
  if (parentId) config.parentId = parentId;

  try {
      chrome.contextMenus.create(config);
      if (item.children) {
          item.children.forEach((child) => createContextMenuItem(child, item.id));
      }
  } catch (error) {
      console.error(`Failed to create context menu '${item.id}':`, error);
  }
}

function removeContextMenus() {
  chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) {
          console.error("Failed to remove context menus:", chrome.runtime.lastError);
      }
  });
}

function updateContextMenus(enabled) {
  removeContextMenus(); // Clear existing menus first
  if (enabled) {
      CONTEXT_MENU_ITEMS.forEach((item) => createContextMenuItem(item));
  }
}

function applySettings() {
  chrome.storage.local.get({ enableContextMenus: true }, (settings) => {
      updateContextMenus(settings.enableContextMenus);
  });
}

chrome.runtime.onStartup.addListener(applySettings);

chrome.runtime.onInstalled.addListener(applySettings);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "enableContextMenus" in changes) {
      updateContextMenus(changes.enableContextMenus.newValue);
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

  chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
          console.error("Failed to send message to tab:", chrome.runtime.lastError);
      }
  });
});