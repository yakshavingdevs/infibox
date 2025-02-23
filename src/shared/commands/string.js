export const stringCommands = {
  name: "String Tools",
  shortcut: "str",
  help: "Tools for string operations.",
  usage: "str <subcommand> - Perform string manipulations.",
  children: [
      {
          name: "Reverse",
          shortcut: "rev",
          requiresInput: true,
          type: "textarea",
          help: "Reverses the order of characters in text.",
          usage: "str rev - Enter text to reverse.",
          processInput: ({ text }) =>
              text.split("").reverse().join("") || "",
      },
      {
          name: "Substring",
          shortcut: "sub",
          requiresInput: true,
          type: "textarea",
          help: "Extracts a portion of text.",
          usage: "str sub - Enter start, end indices, and text.",
          kwargs: [
              {
                  name: "start",
                  type: "number",
                  default: 0,
                  help: "Starting index (0-based)",
              },
              {
                  name: "end",
                  type: "number",
                  default: -1,
                  help: "Ending index (-1 for end)",
              },
          ],
          processInput: ({ start, end, text }) => {
              const s = parseInt(start, 10);
              const e = parseInt(end, 10);
              if (isNaN(s)) {
                  throw new Error("Start index must be a number.");
              }
              if (isNaN(e)) {
                  throw new Error("End index must be a number.");
              }
              return text.slice(s, e === -1 ? undefined : e);
          },
      },
  ],
};