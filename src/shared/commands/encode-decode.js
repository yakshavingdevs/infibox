export const encodeDecodeCommands = {
  name: "Encode/Decode Tools",
  shortcut: "enc",
  help: "Tools for encoding and decoding text.",
  usage: "enc <subcommand> - Choose an encoding/decoding operation.",
  children: [
      {
          name: "URL Encode",
          shortcut: "urlenc",
          requiresInput: true,
          type: "textarea",
          help: "Encodes text for URL safety.",
          usage: "enc urlenc - Enter text to encode.",
          processInput: ({ text }) => encodeURIComponent(text),
      },
      {
          name: "URL Decode",
          shortcut: "urldec",
          requiresInput: true,
          type: "textarea",
          help: "Decodes URL-encoded text.",
          usage: "enc urldec - Enter URL-encoded text.",
          processInput: ({ text }) => {
              try {
                  return decodeURIComponent(text);
              } catch (err) {
                  throw new Error("Invalid URL-encoded text.");
              }
          },
      },
      {
          name: "HTML Escape",
          shortcut: "htmlesc",
          requiresInput: true,
          type: "textarea",
          help: "Escapes HTML special characters.",
          usage: "enc htmlesc - Enter text to escape.",
          processInput: ({ text }) =>
              text
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;"),
      },
      {
          name: "HTML Unescape",
          shortcut: "htmlunesc",
          requiresInput: true,
          type: "textarea",
          help: "Unescapes HTML entities to plain text.",
          usage: "enc htmlunesc - Enter HTML-escaped text.",
          processInput: ({ text }) =>
              text
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'"),
      },
  ],
};