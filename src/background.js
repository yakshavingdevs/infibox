chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items for text selection.
    chrome.contextMenus.create({
      id: "cmdk-base64-encode",
      title: "Base64 Encode",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "cmdk-trim",
      title: "Trim",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "cmdk-trim-full",
      title: "Full Trim",
      parentId: "cmdk-trim",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "cmdk-trim-left",
      title: "Trim Left",
      parentId: "cmdk-trim",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "cmdk-trim-right",
      title: "Trim Right",
      parentId: "cmdk-trim",
      contexts: ["selection"]
    });
    // Create context menu for links.
    chrome.contextMenus.create({
      id: "cmdk-save-link",
      title: "Save Link to To-Do",
      contexts: ["link"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: info.menuItemId,
        selection: info.selectionText || info.linkUrl
      });
    }
  });
  