import type { Command } from "../../types";

export const encodeDecodeCommands: Command = {
  name: "Encode/Decode Tools",
  id: "cmdk-enc",
  shortcut: "enc",
  help: "Tools for encoding and decoding text.",
  usage: "enc <subcommand> - Choose an encoding/decoding operation.",
  children: [
      {
          name: "URL Encode",
          id: "cmdk-enc-urlenc",
          shortcut: "urlenc",
          requiresInput: true,
          type: "textarea",
          help: "Encodes text for URL safety.",
          usage: "enc urlenc - Enter text to encode.",
          processInput: ({ text }) => encodeURIComponent(text),
      },
      {
          name: "URL Decode",
          id: "cmdk-enc-urldec",
          shortcut: "urldec",
          requiresInput: true,
          type: "textarea",
          help: "Decodes URL-encoded text.",
          usage: "enc urldec - Enter URL-encoded text.",
          processInput: ({ text }) => {
              try {
                  return decodeURIComponent(text);
              } catch {
                  throw new Error("Invalid URL-encoded text.");
              }
          },
      },
      {
          name: "HTML Escape",
          id: "cmdk-enc-htmlesc",
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
          id: "cmdk-enc-htmlunesc",
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