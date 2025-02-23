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
      processInput: ({ text }) => text.split("").reverse().join("") || "",
    },
    {
      name: "Substring",
      shortcut: "sub",
      requiresInput: true,
      type: "textarea",
      help: "Extracts a portion of text.",
      usage: "str sub - Enter start, end indices, and text.",
      kwargs: [
        { name: "start", type: "number", default: 0, help: "Starting index (0-based)" },
        { name: "end", type: "number", default: -1, help: "Ending index (-1 for end)" },
      ],
      processInput: ({ start, end, text }) => {
        const s = parseInt(start, 10);
        const e = parseInt(end, 10);
        if (isNaN(s)) throw new Error("Start index must be a number.");
        if (isNaN(e)) throw new Error("End index must be a number.");
        return text.slice(s, e === -1 ? undefined : e) || "";
      },
    },
    {
      name: "Change Case",
      shortcut: "case",
      help: "Change the case of text.",
      usage: "str case <subcommand> - Change text case.",
      children: [
        {
          name: "Uppercase",
          shortcut: "upper",
          requiresInput: true,
          type: "textarea",
          help: "Converts text to uppercase.",
          usage: "str case upper - Enter text to convert.",
          processInput: ({ text }) => text.toUpperCase() || "",
        },
        {
          name: "Lowercase",
          shortcut: "lower",
          requiresInput: true,
          type: "textarea",
          help: "Converts text to lowercase.",
          usage: "str case lower - Enter text to convert.",
          processInput: ({ text }) => text.toLowerCase() || "",
        },
        {
          name: "Capitalize",
          shortcut: "cap",
          requiresInput: true,
          type: "textarea",
          help: "Capitalizes the first letter of each word.",
          usage: "str case cap - Enter text to capitalize.",
          processInput: ({ text }) =>
            text
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ") || "",
        },
        {
          name: "Title Case",
          shortcut: "title",
          requiresInput: true,
          type: "textarea",
          help: "Converts text to title case.",
          usage: "str case title - Enter text to convert.",
          processInput: ({ text }) =>
            text
              .toLowerCase()
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") || "",
        },
      ],
    },
    {
      name: "Trim",
      shortcut: "trim",
      help: "Removes whitespace from text.",
      usage: "str trim <subcommand> - Trim text.",
      children: [
        {
          name: "Full",
          shortcut: "full",
          requiresInput: true,
          type: "textarea",
          help: "Removes leading and trailing whitespace.",
          usage: "str trim full - Enter text to trim.",
          processInput: ({ text }) => text.trim() || "",
        },
        {
          name: "Left",
          shortcut: "left",
          requiresInput: true,
          type: "textarea",
          help: "Removes leading whitespace.",
          usage: "str trim left - Enter text to trim.",
          processInput: ({ text }) => text.trimStart() || "",
        },
        {
          name: "Right",
          shortcut: "right",
          requiresInput: true,
          type: "textarea",
          help: "Removes trailing whitespace.",
          usage: "str trim right - Enter text to trim.",
          processInput: ({ text }) => text.trimEnd() || "",
        },
      ],
    },
    {
      name: "Remove Extra Spaces",
      shortcut: "rmspaces",
      requiresInput: true,
      type: "textarea",
      help: "Removes extra spaces between words.",
      usage: "str rmspaces - Enter text to clean.",
      processInput: ({ text }) => text.replace(/\s+/g, " ").trim() || "",
    },
    {
      name: "Count",
      shortcut: "count",
      help: "Count elements in text.",
      usage: "str count <subcommand> - Count text elements.",
      children: [
        {
          name: "Word Count",
          shortcut: "wordcnt",
          requiresInput: true,
          type: "textarea",
          help: "Counts words in text.",
          usage: "str count wordcnt - Enter text to count words.",
          processInput: ({ text }) => text.trim().split(/\s+/).filter(Boolean).length.toString(),
        },
        {
          name: "Character Count",
          shortcut: "charcnt",
          requiresInput: true,
          type: "textarea",
          help: "Counts characters in text.",
          usage: "str count charcnt - Enter text to count characters.",
          kwargs: [
            { name: "includeWhitespace", type: "boolean", default: true, help: "Whether to count whitespace characters" },
          ],
          processInput: ({ text, includeWhitespace }) =>
            (includeWhitespace ? text.length : text.replace(/\s/g, "").length).toString(),
        },
        {
          name: "Line Count",
          shortcut: "linecnt",
          requiresInput: true,
          type: "textarea",
          help: "Counts lines in text.",
          usage: "str count linecnt - Enter text to count lines.",
          kwargs: [
            { name: "countEmpty", type: "boolean", default: false, help: "Whether to count empty lines" },
          ],
          processInput: ({ text, countEmpty }) =>
            (countEmpty ? text.split("\n").length : text.split("\n").filter(Boolean).length).toString(),
        },
      ],
    },
    {
      name: "Lines",
      shortcut: "lines",
      help: "Manipulate lines in text.",
      usage: "str lines <subcommand> - Manipulate text lines.",
      children: [
        {
          name: "Sort Lines",
          shortcut: "sortlines",
          requiresInput: true,
          type: "textarea",
          help: "Sorts lines alphabetically or numerically.",
          usage: "str lines sortlines - Enter text to sort.",
          kwargs: [
            { name: "order", type: "string", default: "asc", help: "Sort order: 'asc' or 'desc'" },
            { name: "numeric", type: "boolean", default: false, help: "Sort numerically instead of alphabetically" },
          ],
          processInput: ({ text, order, numeric }) => {
            const lines = text.split("\n");
            const sorted = numeric
              ? lines.sort((a, b) => (order === "asc" ? Number(a) - Number(b) : Number(b) - Number(a)))
              : lines.sort((a, b) => (order === "asc" ? a.localeCompare(b) : b.localeCompare(a)));
            return sorted.join("\n") || "";
          },
        },
        {
          name: "Reverse Lines",
          shortcut: "revlines",
          requiresInput: true,
          type: "textarea",
          help: "Reverses the order of lines.",
          usage: "str lines revlines - Enter text to reverse lines.",
          processInput: ({ text }) => text.split("\n").reverse().join("\n") || "",
        },
        {
          name: "Shuffle Lines",
          shortcut: "shufllines",
          requiresInput: true,
          type: "textarea",
          help: "Randomly shuffles lines.",
          usage: "str lines shufllines - Enter text to shuffle lines.",
          processInput: ({ text }) => {
            const lines = text.split("\n");
            for (let i = lines.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [lines[i], lines[j]] = [lines[j], lines[i]];
            }
            return lines.join("\n") || "";
          },
        },
        {
          name: "Remove Duplicates",
          shortcut: "rmdup",
          requiresInput: true,
          type: "textarea",
          help: "Removes duplicate lines.",
          usage: "str lines rmdup - Enter text to remove duplicates.",
          kwargs: [
            { name: "caseSensitive", type: "boolean", default: true, help: "Whether to treat case differently" },
          ],
          processInput: ({ text, caseSensitive }) => {
            const lines = text.split("\n");
            const unique = new Set(caseSensitive ? lines : lines.map(line => line.toLowerCase()));
            return [...unique].join("\n") || "";
          },
        },
      ],
    },
    {
      name: "Replace",
      shortcut: "rep",
      requiresInput: true,
      type: "textarea",
      help: "Replaces text with specified string.",
      usage: "str rep - Enter text, search string, and replacement.",
      kwargs: [
        { name: "search", type: "string", default: "", help: "String to search for" },
        { name: "replace", type: "string", default: "", help: "String to replace with" },
        { name: "all", type: "boolean", default: true, help: "Replace all occurrences or just first" },
      ],
      processInput: ({ text, search, replace, all }) => {
        if (!search) throw new Error("Search string is required.");
        return all
          ? text.replaceAll(search, replace)
          : text.replace(search, replace) || "";
      },
    },
    {
      name: "Split",
      shortcut: "split",
      requiresInput: true,
      type: "textarea",
      help: "Splits text into lines based on delimiter.",
      usage: "str split - Enter text and delimiter.",
      kwargs: [
        { name: "delimiter", type: "string", default: ",", help: "Character or string to split on" },
      ],
      processInput: ({ text, delimiter }) => text.split(delimiter).join("\n") || "",
    },
    {
      name: "Join",
      shortcut: "join",
      requiresInput: true,
      type: "textarea",
      help: "Joins lines into single string with delimiter.",
      usage: "str join - Enter text and delimiter.",
      kwargs: [
        { name: "delimiter", type: "string", default: ",", help: "Character or string to join with" },
      ],
      processInput: ({ text, delimiter }) => text.split("\n").filter(Boolean).join(delimiter) || "",
    },
    {
      name: "Repeat",
      shortcut: "repeat",
      requiresInput: true,
      type: "textarea",
      help: "Repeats text a specified number of times.",
      usage: "str repeat - Enter text and number of repetitions.",
      kwargs: [
        { name: "times", type: "number", default: 1, help: "Number of times to repeat" },
      ],
      processInput: ({ text, times }) => {
        const t = parseInt(times, 10);
        if (isNaN(t) || t < 0) throw new Error("Times must be a non-negative number.");
        return text.repeat(t) || "";
      },
    },
    {
      name: "Pad",
      shortcut: "pad",
      help: "Pads text with a character.",
      usage: "str pad <subcommand> - Pad text.",
      children: [
        {
          name: "Left",
          shortcut: "left",
          requiresInput: true,
          type: "textarea",
          help: "Pads text on the left.",
          usage: "str pad left - Enter text, length, and character.",
          kwargs: [
            { name: "length", type: "number", default: 10, help: "Target length" },
            { name: "char", type: "string", default: " ", help: "Character to pad with" },
          ],
          processInput: ({ text, length, char }) => {
            const len = parseInt(length, 10);
            if (isNaN(len) || len < 0) throw new Error("Length must be a non-negative number.");
            if (!char) throw new Error("Padding character is required.");
            return text.padStart(len, char) || "";
          },
        },
        {
          name: "Right",
          shortcut: "right",
          requiresInput: true,
          type: "textarea",
          help: "Pads text on the right.",
          usage: "str pad right - Enter text, length, and character.",
          kwargs: [
            { name: "length", type: "number", default: 10, help: "Target length" },
            { name: "char", type: "string", default: " ", help: "Character to pad with" },
          ],
          processInput: ({ text, length, char }) => {
            const len = parseInt(length, 10);
            if (isNaN(len) || len < 0) throw new Error("Length must be a non-negative number.");
            if (!char) throw new Error("Padding character is required.");
            return text.padEnd(len, char) || "";
          },
        },
      ],
    },
    {
      name: "Extract",
      shortcut: "extract",
      help: "Extracts text matching a pattern.",
      usage: "str extract <subcommand> - Extract text elements.",
      children: [
        {
          name: "Numbers",
          shortcut: "numbers",
          requiresInput: true,
          type: "textarea",
          help: "Extracts numbers from text.",
          usage: "str extract numbers - Enter text to extract numbers.",
          processInput: ({ text }) => (text.match(/\d+/g) || []).join("\n") || "",
        },
        {
          name: "Letters",
          shortcut: "letters",
          requiresInput: true,
          type: "textarea",
          help: "Extracts letters from text.",
          usage: "str extract letters - Enter text to extract letters.",
          processInput: ({ text }) => (text.match(/[a-zA-Z]+/g) || []).join("\n") || "",
        },
        {
          name: "Words",
          shortcut: "words",
          requiresInput: true,
          type: "textarea",
          help: "Extracts words from text.",
          usage: "str extract words - Enter text to extract words.",
          processInput: ({ text }) => (text.match(/\b\w+\b/g) || []).join("\n") || "",
        },
      ],
    },
  ],
};