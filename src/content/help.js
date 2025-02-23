export function getHelpText(list, prefix = "") {
  let output = "";
  list.forEach((cmd) => {
      output += `${prefix}${cmd.name}:\n`;
      output += `  Shortcut: ${cmd.shortcut || "None"}\n`;
      output += `  Help: ${cmd.help || "No description available."}\n`;
      output += `  Usage: ${cmd.usage || "Not specified."}\n`;
      if (cmd.kwargs) {
          output += "  Kwargs:\n";
          cmd.kwargs.forEach((kwarg) => {
              output +=
                  `    ${kwarg.name} (${kwarg.type}): ${kwarg.help}${kwarg.default
                      ? ` (default: "${kwarg.default}")`
                      : ""
                  }\n`;
          });
      }
      if (cmd.requiresInput) {
          output += `  Input Type: ${cmd.type}\n`;
      }
      output += "\n";
      if (cmd.children) {
          output += getHelpText(cmd.children, prefix + "  ");
      }
  });
  return output || "No commands available.";
}