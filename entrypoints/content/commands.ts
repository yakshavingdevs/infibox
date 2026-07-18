import type { Command } from "../../src/types";
import { getHelpText } from "./help";
import { showRegisteredShortcuts } from "./shortcuts";
import { setAppMode, setAppCurrentResult, setAppToolCommand } from "./app-bridge";
import { allUtilityCommands } from "../../src/shared/commands";

export const defaultCommands: Command[] = [
  {
      name: "Help",
      shortcut: "?",
      help: "Displays help and usage for all commands.",
      usage: "Type '?' or 'help' to see this.",
      inline: true,
      action: () => {
          setAppToolCommand({ name: "Help", processInput: () => "" });
          setAppCurrentResult("<pre>" + getHelpText(defaultCommands) + "</pre>");
          setAppMode("result");
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
      shortcut: "todo",
      inline: true,
      help: "Manage a simple to-do list.",
      usage: "todo - Opens the to-do interface.",
      action: () => setAppMode("todo"),
  },
  ...allUtilityCommands
];
