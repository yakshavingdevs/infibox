export const hashCommand = {
  name: "Hash Tool",
  shortcut: "hash",
  requiresInput: true,
  type: "textarea",
  help: "Generates a simple hash of text.",
  usage: "hash - Enter text to hash.",
  processInput: ({ text }) => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
          hash = (hash << 5) - hash + text.charCodeAt(i);
          hash |= 0; // Convert to 32-bit int
      }
      return hash.toString(16);
  },
};