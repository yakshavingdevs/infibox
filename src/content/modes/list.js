import { globalState } from "../state";
import { setRenderMode } from "../render";
import { defaultCommands } from "../commands";
import { shadow } from "../shadow";
import { hideCmdk } from "../index";
import { getHeaderHTML, attachHeaderEvents } from "../header";

export function executeCommand(result) {
  if (!result || (!result.cmd && !result.name)) {
      console.error("executeCommand called with invalid result:", result);
      return;
  }
  const cmd = result.cmd || result;
  const breadcrumb = result.breadcrumb || [];

  if (breadcrumb.length > 0) {
      globalState.commandStack = [defaultCommands];
      let current = defaultCommands;
      for (const b of breadcrumb) {
          if (b.children) {
              globalState.commandStack.push(b.children);
              current = b.children;
          }
      }
      globalState.currentList = current;
  }

  if (cmd.children) {
      globalState.commandStack.push(cmd.children);
      globalState.currentList = cmd.children;
      globalState.activeIndex = 0;
      setRenderMode("list");
  } else if (cmd.requiresInput) {
      globalState.currentToolCommand = cmd;
      setRenderMode("tool");
  } else if (cmd.action) {
      if (!cmd.inline) hideCmdk();
      cmd.action();
  }
}

export function globalSearch(query, list, breadcrumb) {
  let results = [];
  for (const cmd of list) {
      if (cmd?.name?.toLowerCase().includes(query.toLowerCase())) {
          results.push({ cmd, breadcrumb: [...breadcrumb] });
      }
      if (cmd?.children) {
          results = results.concat(
              globalSearch(query, cmd.children, [...breadcrumb, cmd]),
          );
      }
  }
  return results;
}

export function scrollActiveIntoView() {
  const activeItem = shadow.querySelector(".cmdk-item.active");
  if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

export function updateListItems(listEl, results) {
  listEl.innerHTML = "";
  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "cmdk-item";
    li.textContent = "No commands found";
    listEl.appendChild(li);
    globalState.activeIndex = -1;
  } else {
    if (globalState.activeIndex >= results.length) globalState.activeIndex = results.length - 1;
    if (globalState.activeIndex < 0) globalState.activeIndex = 0;
    results.forEach((result, index) => {
      if (!result.cmd) return;
      const fullPath = result.breadcrumb.length
        ? result.breadcrumb.map((b) => b.name).join(" > ") + " > " +
        result.cmd.name
        : result.cmd.name;
      const li = document.createElement("li");
      li.className = "cmdk-item" +
        (index === globalState.activeIndex ? " active" : "");
      li.textContent = fullPath +
        (result.cmd.shortcut ? ` (${result.cmd.shortcut})` : "");
      li.title = `${result.cmd.help || "No help available."
        }\nUsage: ${result.cmd.usage || "Not specified."}`;
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        executeCommand(result);
      });
      listEl.appendChild(li);
    });
  }
  scrollActiveIntoView();
}

export function handleListInputKeyDown(e) {
  const inputEl = shadow.getElementById("cmdk-input");
  const listEl = shadow.getElementById("cmdk-list");
  if (!inputEl || !listEl) return;

  if (e.key === "Escape") {
    e.preventDefault();
    hideCmdk();
    return;
  }
  if (
    e.key === "ArrowDown"
  ) {
    e.preventDefault();
    if (globalState.currentFiltered.length) {
      globalState.activeIndex = (globalState.activeIndex + 1) % globalState.currentFiltered.length;
      updateListItems(listEl, globalState.currentFiltered);
    }
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (globalState.currentFiltered.length) {
      globalState.activeIndex = (globalState.activeIndex - 1 + globalState.currentFiltered.length) %
        globalState.currentFiltered.length;
      updateListItems(listEl, globalState.currentFiltered);
    }
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (globalState.activeIndex >= 0 && globalState.currentFiltered[globalState.activeIndex]) {
      executeCommand(globalState.currentFiltered[globalState.activeIndex]);
    }
    return;
  }
  if (
    e.key === "Backspace" && globalState.commandStack.length > 1 &&
    inputEl.value === ""
  ) {
    e.preventDefault();
    globalState.commandStack.pop();
    globalState.currentList = globalState.commandStack[globalState.commandStack.length - 1];
    globalState.activeIndex = 0;
    renderListMode();
  }
}

export function renderListMode(filter = "") {
  const container = shadow.getElementById("cmdk-container");
  container.innerHTML = getHeaderHTML() + `
      <input type="text" id="cmdk-input" class="cmdk-input" placeholder="Type a command (? for help)...">
      <ul id="cmdk-list" class="cmdk-list"></ul>
  `;
  attachHeaderEvents();
  const inputEl = shadow.getElementById("cmdk-input");
  inputEl.value = filter || "";
  inputEl.focus();
  inputEl.addEventListener("keydown", handleListInputKeyDown);
  const listEl = shadow.getElementById("cmdk-list");
  let results = filter.trim() === ""
    ? globalState.currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
    : globalSearch(filter, defaultCommands, []);
  globalState.currentFiltered = results;
  updateListItems(listEl, results);
  inputEl.addEventListener("input", (e) => {
    globalState.activeIndex = 0;
    results = e.target.value.trim() === ""
      ? globalState.currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
      : globalSearch(e.target.value, defaultCommands, []);
    globalState.currentFiltered = results;
    updateListItems(listEl, results);
  });
}