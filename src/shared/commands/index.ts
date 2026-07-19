import type { Command, ContextMenuItem } from "../../types";
import { base64Commands } from "./base64";
import { encodeDecodeCommands } from "./encode-decode";
import { hashCommand } from "./hash";
import { jsonCommands } from "./json";
import { numberCommands } from "./number";
import { stringCommands } from "./string";
import { textCommands } from "./text";
import { timeCommands } from "./time";

export const allUtilityCommands: Command[] = [
  textCommands,
  base64Commands,
  numberCommands,
  jsonCommands,
  hashCommand,
  timeCommands,
  encodeDecodeCommands,
  stringCommands,
];

export function buildContextCommandMap(commands: Command[]): Record<string, string> {
  const map: Record<string, string> = {};

  function walk(list: Command[], path: string[]) {
    for (const cmd of list) {
      const fullPath = [...path, cmd.name];
      if (cmd.id) {
        map[cmd.id] = fullPath.join(" > ");
      }
      if (cmd.children) {
        walk(cmd.children, fullPath);
      }
    }
  }

  walk(commands, []);
  return map;
}

export function buildContextMenuItems(commands: Command[]): ContextMenuItem[] {
  const items: ContextMenuItem[] = [];

  for (const cmd of commands) {
    if (!cmd.id) continue;

    const children = cmd.children?.length ? buildContextMenuItems(cmd.children) : undefined;

    items.push({
      id: cmd.id,
      title: cmd.contextMenuTitle ?? cmd.name,
      contexts: ["selection"],
      ...(children?.length ? { children } : {}),
    });
  }

  return items;
}