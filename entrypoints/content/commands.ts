import type { Command } from "../../src/types/index";
import { showRegisteredShortcuts } from "./utils/shortcuts";
import { setMode, setCurrentToolCommand } from "../../src/stores/app";
import { allUtilityCommands } from "../../src/commands";

export const defaultCommands: Command[] = [
  {
      name: "Help",
      shortcut: "?",
      help: "Displays help and usage for all commands.",
      usage: "Type '?' or 'help' to see this.",
      inline: true,
      action: () => {
          setCurrentToolCommand({ name: "Help", processInput: () => "" });
          setMode("result");
      },
  },
  {
      name: "Registered Shortcuts",
      shortcut: "shortcuts",
      inline: true,
      help: "Lists all registered shortcuts.",
      usage: "shortcuts - Displays this list.",
      action: showRegisteredShortcuts,
  },
  {
      name: "To-Do",
      id: "cmdk-todo",
      shortcut: "todo",
      inline: true,
      help: "Manage a simple to-do list.",
      usage: "todo - Opens the to-do interface.",
      action: () => setMode("todo"),
  },
  ...allUtilityCommands
];
