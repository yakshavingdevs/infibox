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
        id: "cmdk-case",
        title: "Change Case",
        contexts: ["selection"],
        children: [
            {
                id: "cmdk-case-up",
                title: "To Uppercase",
                contexts: ["selection"],
            },
            {
                id: "cmdk-case-low",
                title: "To Lowercase",
                contexts: ["selection"],
            },
            {
                id: "cmdk-case-cap",
                title: "Capitalize Words",
                contexts: ["selection"],
            },
        ],
    },
    {
        id: "cmdk-rep",
        title: "Replace Text",
        contexts: ["selection"],
    },
    {
        id: "cmdk-split",
        title: "Split Text",
        contexts: ["selection"],
    },
    {
        id: "cmdk-join",
        title: "Join Lines",
        contexts: ["selection"],
    },
    {
        id: "cmdk-count",
        title: "Count",
        contexts: ["selection"],
        children: [
            {
                id: "cmdk-count-wc",
                title: "Words",
                contexts: ["selection"],
            },
            {
                id: "cmdk-count-cc",
                title: "Characters",
                contexts: ["selection"],
            },
            {
                id: "cmdk-count-lc",
                title: "Lines",
                contexts: ["selection"],
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
        title: "Hash Text",
        contexts: ["selection"],
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
        id: "cmdk-str",
        title: "String Tools",
        contexts: ["selection"],
        children: [
            {
                id: "cmdk-str-rev",
                title: "Reverse",
                contexts: ["selection"],
            },
            {
                id: "cmdk-str-sub",
                title: "Substring",
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
            item.children.forEach(child => createContextMenuItem(child, item.id));
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
    removeContextMenus();
    if (enabled) {
        CONTEXT_MENU_ITEMS.forEach(item => createContextMenuItem(item));
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