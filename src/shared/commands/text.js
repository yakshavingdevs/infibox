export const textCommands = {
  name: "Text Tools",
  shortcut: "txt",
  help: "Tools for manipulating text.",
  usage:
      "txt <subcommand> - Use subcommands for specific text operations.",
  children: [
      {
          name: "Trim",
          shortcut: "trim",
          help: "Remove whitespace from text.",
          usage: "txt trim <subcommand> - Choose a trim operation.",
          children: [
              {
                  name: "Full Trim",
                  shortcut: "full",
                  requiresInput: true,
                  type: "textarea",
                  help: "Removes whitespace from both ends of text.",
                  usage: "txt trim full - Enter text to trim.",
                  processInput: ({ text }) => text.trim() || "",
              },
              {
                  name: "Trim Left",
                  shortcut: "left",
                  requiresInput: true,
                  type: "textarea",
                  help: "Removes leading whitespace from text.",
                  usage: "txt trim left - Enter text to trim.",
                  processInput: ({ text }) =>
                      text.replace(/^\s+/, "") || "",
              },
              {
                  name: "Trim Right",
                  shortcut: "right",
                  requiresInput: true,
                  type: "textarea",
                  help: "Removes trailing whitespace from text.",
                  usage: "txt trim right - Enter text to trim.",
                  processInput: ({ text }) =>
                      text.replace(/\s+$/, "") || "",
              },
          ],
      },
      {
          name: "Change Case",
          shortcut: "case",
          help: "Change text case.",
          usage: "txt case <subcommand> - Choose a case operation.",
          children: [
              {
                  name: "To Uppercase",
                  shortcut: "up",
                  requiresInput: true,
                  type: "textarea",
                  help: "Converts all text to uppercase.",
                  usage: "txt case up - Enter text to convert.",
                  processInput: ({ text }) => text.toUpperCase() || "",
              },
              {
                  name: "To Lowercase",
                  shortcut: "low",
                  requiresInput: true,
                  type: "textarea",
                  help: "Converts all text to lowercase.",
                  usage: "txt case low - Enter text to convert.",
                  processInput: ({ text }) => text.toLowerCase() || "",
              },
              {
                  name: "Capitalize Words",
                  shortcut: "cap",
                  requiresInput: true,
                  type: "textarea",
                  help: "Capitalizes the first letter of each word.",
                  usage: "txt case cap - Enter text to capitalize.",
                  processInput: ({ text }) =>
                      text
                          .split(/\s+/)
                          .map((word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ") || "",
              },
          ],
      },
      {
          name: "Replace Text",
          shortcut: "rep",
          requiresInput: true,
          type: "textarea",
          help:
              "Replaces all occurrences of a search term with a replacement.",
          usage: "txt rep - Enter search term, replacement, and text.",
          kwargs: [
              { name: "search", type: "text", help: "Text to find" },
              {
                  name: "replace",
                  type: "text",
                  default: "",
                  help: "Text to replace with",
              },
          ],
          processInput: ({ search, replace, text }) => {
              if (!search) throw new Error("Search term is required.");
              return text.replaceAll(search, replace || "");
          },
      },
      {
          name: "Split Text",
          shortcut: "split",
          requiresInput: true,
          type: "textarea",
          help: "Splits text into lines using a separator.",
          usage: "txt split - Enter separator and text to split.",
          kwargs: [
              {
                  name: "separator",
                  type: "text",
                  default: " ",
                  help: "String to split text by",
              },
              {
                  name: "limit",
                  type: "number",
                  default: -1,
                  help: "Max number of splits (-1 for unlimited)",
              },
          ],
          processInput: ({ separator, limit, text }) => {
              const maxSplits = parseInt(limit, 10);
              if (isNaN(maxSplits)) {
                  throw new Error("Limit must be a number.");
              }
              return text.split(
                  separator,
                  maxSplits > 0 ? maxSplits + 1 : undefined,
              ).join("\n");
          },
      },
      {
          name: "Join Lines",
          shortcut: "join",
          requiresInput: true,
          type: "textarea",
          help: "Joins lines into a single string with a separator.",
          usage: "txt join - Enter separator and lines to join.",
          kwargs: [
              {
                  name: "separator",
                  type: "text",
                  default: " ",
                  help: "String to join lines with",
              },
          ],
          processInput: ({ separator, text }) =>
              text.split("\n").join(separator),
      },
      {
          name: "Count",
          shortcut: "count",
          help: "Count elements in text.",
          usage: "txt count <subcommand> - Choose what to count.",
          children: [
              {
                  name: "Words",
                  shortcut: "wc",
                  requiresInput: true,
                  type: "textarea",
                  help: "Counts the number of words in text.",
                  usage: "txt count wc - Enter text to count words.",
                  processInput: ({ text }) => {
                      const words = text.trim().split(/\s+/).filter(
                          Boolean,
                      );
                      return `${words.length} word${
                          words.length === 1 ? "" : "s"
                      }`;
                  },
              },
              {
                  name: "Characters",
                  shortcut: "cc",
                  requiresInput: true,
                  type: "textarea",
                  help: "Counts the total characters in text.",
                  usage: "txt count cc - Enter text to count characters.",
                  processInput: ({ text }) =>
                      `${text.length} character${
                          text.length === 1 ? "" : "s"
                      }`,
              },
              {
                  name: "Lines",
                  shortcut: "lc",
                  requiresInput: true,
                  type: "textarea",
                  help: "Counts non-empty lines in text.",
                  usage: "txt count lc - Enter text to count lines.",
                  processInput: ({ text }) => {
                      const lines = text.split("\n").filter(Boolean);
                      return `${lines.length} line${
                          lines.length === 1 ? "" : "s"
                      }`;
                  },
              },
          ],
      },
  ],
};