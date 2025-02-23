export const jsonCommands = {
  name: "JSON Tools",
  shortcut: "json",
  help: "Tools for JSON manipulation.",
  usage: "json <subcommand> - Parse or stringify JSON.",
  children: [
      {
          name: "Parse JSON",
          shortcut: "parse",
          requiresInput: true,
          type: "textarea",
          help: "Converts JSON string to a readable object string.",
          usage: "json parse - Enter JSON string.",
          processInput: ({ text }) => {
              if (!text) throw new Error("JSON string cannot be empty.");
              try {
                  const obj = JSON.parse(text);
                  return JSON.stringify(obj, null, 2);
              } catch (err) {
                  throw new Error("Invalid JSON: " + err.message);
              }
          },
      },
      {
          name: "Stringify JSON",
          shortcut: "string",
          requiresInput: true,
          type: "textarea",
          help: "Converts a JSON object string to a single-line string.",
          usage: "json string - Enter JSON object string.",
          processInput: ({ text }) => {
              if (!text) throw new Error("JSON string cannot be empty.");
              try {
                  const obj = JSON.parse(text);
                  return JSON.stringify(obj);
              } catch (err) {
                  throw new Error("Invalid JSON: " + err.message);
              }
          },
      },
  ],
};