import { getHelpText } from "./help";
import { showRegisteredShortcuts } from "./shortcuts";
import { globalState } from "./state";
import { setRenderMode } from "./render";
import { allUtilityCommands } from "../shared/commands";

export const defaultCommands = [
  {
      name: "Help",
      shortcut: "?",
      help: "Displays help and usage for all commands.",
      usage: "Type '?' or 'help' to see this.",
      inline: true,
      action: () => {
          globalState.currentToolCommand = { name: "Help", processInput: () => "" };
          globalState.currentResult = "<pre>" + getHelpText(defaultCommands) + "</pre>";
          setRenderMode("result");
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
      action: () => setRenderMode("todo"),
  },
  ...allUtilityCommands
];