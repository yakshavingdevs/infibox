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
        shadow.host.style.setProperty(
            "--primary",
            changes.primaryColor.newValue,
        );
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

document.addEventListener("keydown", (e) => {
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
                defaultCommands,
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
}, { capture: true });

export const contextCommandMap = {
    "cmdk-base64-encode": "Base64 Tool > Base64 Encode",
    "cmdk-trim-full": "Text Tools > Trim > Full Trim",
    "cmdk-trim-left": "Text Tools > Trim > Trim Left",
    "cmdk-trim-right": "Text Tools > Trim > Trim Right",
    "cmdk-case-up": "Text Tools > Change Case > To Uppercase",
    "cmdk-case-low": "Text Tools > Change Case > To Lowercase",
    "cmdk-case-cap": "Text Tools > Change Case > Capitalize Words",
    "cmdk-rep": "Text Tools > Replace Text",
    "cmdk-split": "Text Tools > Split Text",
    "cmdk-join": "Text Tools > Join Lines",
    "cmdk-count-wc": "Text Tools > Count > Words",
    "cmdk-count-cc": "Text Tools > Count > Characters",
    "cmdk-count-lc": "Text Tools > Count > Lines",
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
    "cmdk-todo": "To-Do",
};

export function searchCommandByPath(path, list) {
    const parts = path.split(">").map((s) => s.trim().toLowerCase());
    let currentList = list;
    let found = null;
    for (const part of parts) {
        found = currentList.find((cmd) =>
            cmd?.name?.toLowerCase() === part
        );
        if (!found) {
            console.error(
                "No command found for part:",
                part,
                "in",
                currentList.map((c) => c?.name || "undefined"),
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
                        const textInput = shadow.getElementById(
                            "tool-text",
                        );
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