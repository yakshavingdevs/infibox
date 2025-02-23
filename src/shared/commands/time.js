import { setRenderMode } from "../../content/render";

export const timeCommands = {
  name: "Time Tools",
  shortcut: "time",
  help: "Tools for handling timestamps.",
  usage: "time <subcommand> - Work with timestamps.",
  children: [
      {
          name: "Current Timestamp",
          shortcut: "now",
          help: "Displays the current Unix timestamp in seconds.",
          usage: "time now - No input needed.",
          inline: true,
          action: () => {
              globalState.currentToolCommand = {
                  name: "Current Timestamp",
                  processInput: () => "",
              };
              globalState.currentResult = Math.floor(Date.now() / 1000).toString();
              setRenderMode("result");
          },
      },
      {
          name: "Format Timestamp",
          shortcut: "fmt",
          requiresInput: true,
          type: "number",
          help: "Converts a Unix timestamp (seconds) to ISO format.",
          usage: "time fmt - Enter timestamp in seconds.",
          processInput: ({ text }) => {
              const ts = parseInt(text, 10);
              if (isNaN(ts)) throw new Error("Invalid timestamp.");
              return new Date(ts * 1000).toISOString();
          },
      },
  ],
};