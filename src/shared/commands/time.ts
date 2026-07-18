import type { Command } from "../../types";
import { setAppMode, setAppCurrentResult, setAppToolCommand } from "../../../entrypoints/content/app-bridge";

export const timeCommands: Command = {
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
              setAppToolCommand({
                  name: "Current Timestamp",
                  processInput: () => "",
              });
              setAppCurrentResult(Math.floor(Date.now() / 1000).toString());
              setAppMode("result");
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