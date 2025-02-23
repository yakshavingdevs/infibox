const CONTEXT_MENU_ITEMS = [
  {
    id: "cmdk-base64-encode",
    title: "Base64 Encode",
    contexts: ["selection"],
  },
  {
    id: "cmdk-str",
    title: "String Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-str-rev",
        title: "Reverse Text",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-sub",
        title: "Substring",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-case",
        title: "Change Case",
        contexts: ["selection"],
        children: [
          {
            id: "cmdk-str-upper",
            title: "To Uppercase",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-lower",
            title: "To Lowercase",
            contexts: ["selection"],
          },
          { id: "cmdk-str-cap", title: "Capitalize", contexts: ["selection"] },
          {
            id: "cmdk-str-title",
            title: "Title Case",
            contexts: ["selection"],
          },
        ],
      },
      {
        id: "cmdk-str-trim",
        title: "Trim",
        contexts: ["selection"],
        children: [
          {
            id: "cmdk-str-trim-full",
            title: "Full Trim",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-trim-left",
            title: "Trim Left",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-trim-right",
            title: "Trim Right",
            contexts: ["selection"],
          },
        ],
      },
      {
        id: "cmdk-str-rmspaces",
        title: "Remove Extra Spaces",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-count",
        title: "Count",
        contexts: ["selection"],
        children: [
          { id: "cmdk-str-wordcnt", title: "Words", contexts: ["selection"] },
          {
            id: "cmdk-str-charcnt",
            title: "Characters",
            contexts: ["selection"],
          },
          { id: "cmdk-str-linecnt", title: "Lines", contexts: ["selection"] },
        ],
      },
      {
        id: "cmdk-str-lines",
        title: "Lines",
        contexts: ["selection"],
        children: [
          {
            id: "cmdk-str-sortlines",
            title: "Sort Lines",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-revlines",
            title: "Reverse Lines",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-shufllines",
            title: "Shuffle Lines",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-rmdup",
            title: "Remove Duplicates",
            contexts: ["selection"],
          },
        ],
      },
      {
        id: "cmdk-str-rep",
        title: "Replace Text",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-split",
        title: "Split Text",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-join",
        title: "Join Lines",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-repeat",
        title: "Repeat Text",
        contexts: ["selection"],
      },
      {
        id: "cmdk-str-pad",
        title: "Pad Text",
        contexts: ["selection"],
        children: [
          {
            id: "cmdk-str-pad-left",
            title: "Pad Left",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-pad-right",
            title: "Pad Right",
            contexts: ["selection"],
          },
        ],
      },
      {
        id: "cmdk-str-extract",
        title: "Extract",
        contexts: ["selection"],
        children: [
          {
            id: "cmdk-str-extract-numbers",
            title: "Numbers",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-extract-letters",
            title: "Letters",
            contexts: ["selection"],
          },
          {
            id: "cmdk-str-extract-words",
            title: "Words",
            contexts: ["selection"],
          },
        ],
      },
    ],
  },
  {
    id: "cmdk-num",
    title: "Number Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-num-hex",
        title: "Decimal to Hex",
        contexts: ["selection"],
      },
      {
        id: "cmdk-num-dec",
        title: "Hex to Decimal",
        contexts: ["selection"],
      },
      {
        id: "cmdk-num-bin",
        title: "Decimal to Binary",
        contexts: ["selection"],
      },
      {
        id: "cmdk-num-decbin",
        title: "Binary to Decimal",
        contexts: ["selection"],
      },
    ],
  },
  {
    id: "cmdk-json",
    title: "JSON Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-json-parse",
        title: "Parse JSON",
        contexts: ["selection"],
      },
      {
        id: "cmdk-json-string",
        title: "Stringify JSON",
        contexts: ["selection"],
      },
    ],
  },
  {
    id: "cmdk-hash",
    title: "Hash Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-hash-simple",
        title: "Simple Hash",
        contexts: ["selection"],
      },
      {
        id: "cmdk-hash-fnv1a",
        title: "FNV-1a",
        contexts: ["selection"],
      },
      {
        id: "cmdk-hash-djb2",
        title: "djb2",
        contexts: ["selection"],
      },
      {
        id: "cmdk-hash-sdbm",
        title: "sdbm",
        contexts: ["selection"],
      },
      {
        id: "cmdk-hash-murmur",
        title: "Murmur3-like",
        contexts: ["selection"],
      },
    ],
  },
  {
    id: "cmdk-time",
    title: "Time Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-time-now",
        title: "Current Timestamp",
        contexts: ["selection"],
      },
      {
        id: "cmdk-time-fmt",
        title: "Format Timestamp",
        contexts: ["selection"],
      },
    ],
  },
  {
    id: "cmdk-enc",
    title: "Encode/Decode Tools",
    contexts: ["selection"],
    children: [
      {
        id: "cmdk-enc-urlenc",
        title: "URL Encode",
        contexts: ["selection"],
      },
      {
        id: "cmdk-enc-urldec",
        title: "URL Decode",
        contexts: ["selection"],
      },
      {
        id: "cmdk-enc-htmlesc",
        title: "HTML Escape",
        contexts: ["selection"],
      },
      {
        id: "cmdk-enc-htmlunesc",
        title: "HTML Unescape",
        contexts: ["selection"],
      },
    ],
  },
  {
    id: "cmdk-todo",
    title: "Save to To-Do",
    contexts: ["selection", "link"],
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
      console.error(
        "Failed to remove context menus:",
        chrome.runtime.lastError
      );
    }
  });
}

function updateContextMenus(enabled) {
  removeContextMenus();
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
