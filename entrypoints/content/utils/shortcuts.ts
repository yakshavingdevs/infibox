import type { Command, MatchResult } from "../../src/types/index";
import { setMode, setCurrentToolCommand } from "../../../src/stores/app";

export function matchShortcut(buffer: string, list: Command[]): MatchResult {
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

export function showRegisteredShortcuts(): void {
  setCurrentToolCommand({
      name: "Registered Shortcuts",
      processInput: (body) => typeof body === "string" ? body : "",
  });
  setMode("result");
}
