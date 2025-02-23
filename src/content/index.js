import { matchShortcut } from "./shortcuts";
import { globalState, resetCmdkState } from "./state";
import { defaultCommands } from "./commands";
import { setRenderMode } from "./render";
import { shadow } from "./shadow";
import { addTodo, loadTodoTasks } from "../shared/todo";

chrome.storage.local.get({ primaryColor: "#000000" }, (settings) => {
  shadow.host.style.setProperty("--primary", settings.primaryColor);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "primaryColor" in changes) {
    shadow.host.style.setProperty("--primary", changes.primaryColor.newValue);
  }
});

export function initCmdk() {
  globalState.commandStack = [defaultCommands];
  globalState.currentList = defaultCommands;
  globalState.activeIndex = 0;
  globalState.currentFiltered = globalState.currentList;
  setRenderMode("list");
}

export function showCmdk(toolCommand = null) {
  shadow.getElementById("cmdk-overlay").classList.add("open");
  if (toolCommand) {
    globalState.currentToolCommand = toolCommand;
    globalState.currentMode = "list";
    globalState.commandStack = [defaultCommands];
    globalState.currentList = defaultCommands;
    globalState.activeIndex = 0;
    globalState.currentFiltered = globalState.currentList;
    globalState.currentResult = "";
  } else {
    resetCmdkState();
    initCmdk();
  }
}

export function hideCmdk() {
  shadow.getElementById("cmdk-overlay").classList.remove("open");
  resetCmdkState();
  document.body.focus();
}

document.addEventListener(
  "keydown",
  (e) => {
    const overlayEl = shadow.getElementById("cmdk-overlay");
    if (!overlayEl.classList.contains("open")) {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        globalState.shortcutBuffer += e.key.toLowerCase();
        clearTimeout(globalState.shortcutTimer);
        globalState.shortcutTimer = setTimeout(() => {
          globalState.shortcutBuffer = "";
        }, 1000);
        const { exact, partial } = matchShortcut(
          globalState.shortcutBuffer,
          defaultCommands
        );
        if (exact) {
          e.preventDefault();
          if (exact.children) {
            globalState.commandStack = [exact.children];
            globalState.currentList = exact.children;
            globalState.activeIndex = 0;
            showCmdk();
          } else if (exact.requiresInput) {
            showCmdk();
            globalState.currentToolCommand = exact;
            setRenderMode("tool");
          } else if (exact.action) {
            if (!exact.inline) hideCmdk();
            exact.action();
          }
          globalState.shortcutBuffer = "";
          return;
        } else if (!partial) globalState.shortcutBuffer = "";
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        showCmdk();
      }
    }
  },
  { capture: true }
);

export const contextCommandMap = {
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

export function searchCommandByPath(path, list) {
  const parts = path.split(">").map((s) => s.trim().toLowerCase());
  let currentList = list;
  let found = null;
  for (const part of parts) {
    found = currentList.find((cmd) => cmd?.name?.toLowerCase() === part);
    if (!found) {
      console.error(
        "No command found for part:",
        part,
        "in",
        currentList.map((c) => c?.name || "undefined")
      );
      return null;
    }
    currentList = found.children || [];
  }
  return found;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action && request.selection) {
    if (request.action === "cmdk-todo") {
      loadTodoTasks(() => {
        addTodo(request.selection);
        alert("Saved to To-Do");
      });
      return;
    }
    const desiredPath = contextCommandMap[request.action];
    if (desiredPath) {
      const cmd = searchCommandByPath(desiredPath, defaultCommands);
      if (cmd) {
        if (cmd.requiresInput) {
          globalState.currentToolCommand = cmd;
          showCmdk(cmd);
          setRenderMode("tool");
          setTimeout(() => {
            const textInput = shadow.getElementById("tool-text");
            if (textInput) {
              textInput.value = request.selection;
              textInput.focus();
            }
          }, 100);
        } else if (cmd.action) {
          cmd.action();
        }
      }
    }
  }
});
