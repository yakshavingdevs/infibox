import { globalState } from "./state";
import { setRenderMode } from "./render";
import { defaultCommands } from "./commands";

export function matchShortcut(buffer, list) {
  let exact = null;
  let partial = false;
  for (const cmd of list) {
      if (cmd?.shortcut) {
          const sc = cmd.shortcut.toLowerCase();
          if (sc === buffer) {
              exact = cmd;
              break;
          } else if (sc.startsWith(buffer)) partial = true;
      }
      if (cmd?.children) {
          const { exact: childExact, partial: childPartial } =
              matchShortcut(buffer, cmd.children);
          if (childExact) {
              exact = childExact;
              break;
          }
          if (childPartial) partial = true;
      }
  }
  return { exact, partial };
}

export function getRegisteredShortcuts(list = defaultCommands, prefix = "") {
  let output = "";
  list.forEach((cmd) => {
      if (cmd?.shortcut) {
          output += `${prefix}${cmd.name}: ${cmd.shortcut}\n`;
      }
      if (cmd?.children) {
          output += getRegisteredShortcuts(
              cmd.children,
              prefix + cmd.name + " > ",
          );
      }
  });
  return output || "No shortcuts registered.";
}

export function showRegisteredShortcuts() {
  globalState.currentToolCommand = {
      name: "Registered Shortcuts",
      processInput: (body) => body,
  };
  globalState.currentResult = "<pre>" + getRegisteredShortcuts() + "</pre>";
  setRenderMode("result");
}