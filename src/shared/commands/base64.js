export const base64Commands = {
  name: "Base64 Tool",
  shortcut: "b64",
  help: "Tools for Base64 encoding and decoding.",
  usage: "b64 <subcommand> - Choose an encoding operation.",
  children: [
      {
          name: "Base64 Encode",
          shortcut: "enc",
          requiresInput: true,
          type: "textarea",
          help: "Encodes text to Base64.",
          usage: "b64 enc - Enter text to encode.",
          processInput: ({ text }) => {
              if (!text) throw new Error("Input cannot be empty.");
              try {
                  return btoa(text);
              } catch (err) {
                  throw new Error(
                      "Invalid input for Base64 encoding.",
                  );
              }
          },
      },
      {
          name: "Base64 Decode",
          shortcut: "dec",
          requiresInput: true,
          type: "textarea",
          help: "Decodes Base64 text to plain text.",
          usage: "b64 dec - Enter Base64 text to decode.",
          processInput: ({ text }) => {
              if (!text) throw new Error("Input cannot be empty.");
              try {
                  return atob(text);
              } catch (err) {
                  throw new Error("Invalid Base64 input.");
              }
          },
      },
  ],
};