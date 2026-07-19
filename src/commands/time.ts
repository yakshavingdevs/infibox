import type { Command } from "../types/index";
import { setMode, setCurrentResult, setCurrentToolCommand } from "../stores/app";

export const timeCommands: Command = {
  name: "Time Tools",
  id: "cmdk-time",
  shortcut: "time",
  help: "Tools for handling timestamps.",
  usage: "time <subcommand> - Work with timestamps.",
  children: [
      {
          name: "Current Timestamp",
          id: "cmdk-time-now",
          shortcut: "now",
          help: "Displays the current Unix timestamp in seconds.",
          usage: "time now - No input needed.",
          inline: true,
          action: () => {
              setCurrentToolCommand({
                  name: "Current Timestamp",
                  processInput: () => "",
              });
              setCurrentResult(Math.floor(Date.now() / 1000).toString());
              setMode("result");
          },
      },
      {
          name: "Format Timestamp",
          id: "cmdk-time-fmt",
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