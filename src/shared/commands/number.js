export const numberCommands = {
  name: "Number Tools",
  shortcut: "num",
  help: "Tools for number conversions.",
  usage: "num <subcommand> - Convert numbers between bases.",
  children: [
      {
          name: "Decimal to Hex",
          shortcut: "hex",
          requiresInput: true,
          type: "number",
          help: "Converts a decimal number to hexadecimal.",
          usage: "num hex - Enter a decimal number.",
          processInput: ({ text }) => {
              const num = parseInt(text, 10);
              if (isNaN(num)) throw new Error("Invalid decimal number.");
              return num.toString(16).toUpperCase();
          },
      },
      {
          name: "Hex to Decimal",
          shortcut: "dec",
          requiresInput: true,
          type: "text",
          help: "Converts a hexadecimal number to decimal.",
          usage: "num dec - Enter a hex number (e.g., FF).",
          processInput: ({ text }) => {
              const num = parseInt(text, 16);
              if (isNaN(num)) throw new Error("Invalid hex number.");
              return num.toString(10);
          },
      },
      {
          name: "Decimal to Binary",
          shortcut: "bin",
          requiresInput: true,
          type: "number",
          help: "Converts a decimal number to binary.",
          usage: "num bin - Enter a decimal number.",
          processInput: ({ text }) => {
              const num = parseInt(text, 10);
              if (isNaN(num)) throw new Error("Invalid decimal number.");
              return num.toString(2);
          },
      },
      {
          name: "Binary to Decimal",
          shortcut: "decbin",
          requiresInput: true,
          type: "text",
          help: "Converts a binary number to decimal.",
          usage: "num decbin - Enter a binary number (e.g., 1010).",
          processInput: ({ text }) => {
              const num = parseInt(text, 2);
              if (isNaN(num)) throw new Error("Invalid binary number.");
              return num.toString(10);
          },
      },
  ],
};