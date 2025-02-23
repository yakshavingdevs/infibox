(() => {
    const shadow = window.__CMDK_SHADOW_ROOT__;
    if (!shadow) return;

    const textCommands = {
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

    const numberCommands = {
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

    const jsonCommands = {
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

    const hashCommand = {
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

    const timeCommands = {
        name: "Time Tools",
        shortcut: "time",
        help: "Tools for handling timestamps.",
        usage: "time <subcommand> - Work with timestamps.",
        children: [
            {
                name: "Current Timestamp",
                shortcut: "now",
                help: "Displays the current Unix timestamp in seconds.",
                usage: "time now - No input needed.",
                inline: true,
                action: () => {
                    currentToolCommand = {
                        name: "Current Timestamp",
                        processInput: () => "",
                    };
                    currentResult = Math.floor(Date.now() / 1000).toString();
                    setMode("result");
                },
            },
            {
                name: "Format Timestamp",
                shortcut: "fmt",
                requiresInput: true,
                type: "number",
                help: "Converts a Unix timestamp (seconds) to ISO format.",
                usage: "time fmt - Enter timestamp in seconds.",
                processInput: ({ text }) => {
                    const ts = parseInt(text, 10);
                    if (isNaN(ts)) throw new Error("Invalid timestamp.");
                    return new Date(ts * 1000).toISOString();
                },
            },
        ],
    };

    const encodeDecodeCommands = {
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

    const stringCommands = {
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

    // Apply primary color from settings
    chrome.storage.local.get({ primaryColor: "#000000" }, (settings) => {
        shadow.host.style.setProperty("--primary", settings.primaryColor);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && "primaryColor" in changes) {
            shadow.host.style.setProperty(
                "--primary",
                changes.primaryColor.newValue,
            );
        }
    });

    /******** Global State ********/
    let currentMode = "list";
    let commandStack = [];
    let currentList = [];
    let activeIndex = 0;
    let currentFiltered = [];
    let currentToolCommand = null;
    let currentResult = "";
    let todoTasks = [];
    let shortcutBuffer = "";
    let shortcutTimer;

    /******** Default Command Definitions ********/
    const defaultCommands = [
        {
            name: "Help",
            shortcut: "?",
            help: "Displays help and usage for all commands.",
            usage: "Type '?' or 'help' to see this.",
            inline: true,
            action: () => {
                currentToolCommand = { name: "Help", processInput: () => "" };
                currentResult = "<pre>" + getHelpText(commands) + "</pre>";
                setMode("result");
            },
        },
        textCommands,
        {
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
        },
        numberCommands,
        jsonCommands,
        hashCommand,
        timeCommands,
        encodeDecodeCommands,
        stringCommands,
        {
            name: "Registered Shortcuts",
            shortcut: "shortcuts",
            inline: true,
            help: "Lists all registered shortcuts.",
            usage: "shortcuts - Displays this list.",
            action: showRegisteredShortcuts,
        },
        {
            name: "To-Do",
            shortcut: "todo",
            inline: true,
            help: "Manage a simple to-do list.",
            usage: "todo - Opens the to-do interface.",
            action: () => setMode("todo"),
        },
    ];

    let commands = defaultCommands;

    /******** Storage Functions ********/
    function loadTodoTasks(callback) {
        chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
            todoTasks = result.cmdkTodoTasks || [];
            if (callback) callback();
        });
    }
    function saveTodoTasks() {
        chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
    }

    /******** Helper Functions ********/
    function getHelpText(list, prefix = "") {
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
                        `    ${kwarg.name} (${kwarg.type}): ${kwarg.help}${
                            kwarg.default
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

    function getHeaderHTML() {
        return `
            <div class="cmdk-header">
                <button id="home-button" class="home-button">Home</button>
                <div class="cmdk-hints">
                    Enter: Submit • ↑/↓ or Ctrl+N/Ctrl+P: Navigate • Esc: Cancel • Backspace: Back • ?: Help
                </div>
            </div>
        `;
    }

    function attachHeaderEvents() {
        const homeButton = shadow.getElementById("home-button");
        if (homeButton) {
            homeButton.addEventListener("click", (e) => {
                e.stopPropagation();
                commandStack = [commands];
                currentList = commands;
                activeIndex = 0;
                setMode("list");
            });
        }
    }

    function globalSearch(query, list, breadcrumb) {
        let results = [];
        for (const cmd of list) {
            if (cmd?.name?.toLowerCase().includes(query.toLowerCase())) {
                results.push({ cmd, breadcrumb: [...breadcrumb] });
            }
            if (cmd?.children) {
                results = results.concat(
                    globalSearch(query, cmd.children, [...breadcrumb, cmd]),
                );
            }
        }
        return results;
    }

    function matchShortcut(buffer, list) {
        let exact = null;
        let partial = false;
        for (const cmd of list) {
            if (cmd?.shortcut) {
                const sc = cmd.shortcut.toLowerCase();
                if (sc === buffer) {
                    exact = cmd;
                    break;
                } else if (sc.startsWith(buffer)) partial = true;
            }
            if (cmd?.children) {
                const { exact: childExact, partial: childPartial } =
                    matchShortcut(buffer, cmd.children);
                if (childExact) {
                    exact = childExact;
                    break;
                }
                if (childPartial) partial = true;
            }
        }
        return { exact, partial };
    }

    function scrollActiveIntoView() {
        const activeItem = shadow.querySelector(".cmdk-item.active");
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    function resetCmdkState() {
        currentMode = "list";
        commandStack = [];
        currentList = [];
        activeIndex = 0;
        currentFiltered = [];
        currentToolCommand = null;
        currentResult = "";
    }

    function initCmdk() {
        commandStack = [commands];
        currentList = commands;
        activeIndex = 0;
        currentFiltered = currentList;
        setMode("list");
    }

    function setMode(mode) {
        currentMode = mode;
        render();
    }

    function showCmdk(toolCommand = null) {
        shadow.getElementById("cmdk-overlay").classList.add("open");
        if (toolCommand) {
            currentToolCommand = toolCommand;
            currentMode = "list";
            commandStack = [commands];
            currentList = commands;
            activeIndex = 0;
            currentFiltered = currentList;
            currentResult = "";
        } else {
            resetCmdkState();
            initCmdk();
        }
    }

    function hideCmdk() {
        shadow.getElementById("cmdk-overlay").classList.remove("open");
        resetCmdkState();
        document.body.focus();
    }

    function render() {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = "";
        if (currentMode === "list") renderListMode();
        else if (currentMode === "tool") renderToolMode();
        else if (currentMode === "result") renderResultMode();
        else if (currentMode === "todo") renderTodoMode();
    }

    function renderListMode(filter = "") {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = getHeaderHTML() + `
            <input type="text" id="cmdk-input" class="cmdk-input" placeholder="Type a command (? for help)...">
            <ul id="cmdk-list" class="cmdk-list"></ul>
        `;
        attachHeaderEvents();
        const inputEl = shadow.getElementById("cmdk-input");
        inputEl.value = filter || "";
        inputEl.focus();
        inputEl.addEventListener("keydown", handleListInputKeyDown);
        const listEl = shadow.getElementById("cmdk-list");
        let results = filter.trim() === ""
            ? currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
            : globalSearch(filter, commands, []);
        currentFiltered = results;
        updateListItems(listEl, results);
        inputEl.addEventListener("input", (e) => {
            activeIndex = 0;
            results = e.target.value.trim() === ""
                ? currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
                : globalSearch(e.target.value, commands, []);
            currentFiltered = results;
            updateListItems(listEl, results);
        });
    }

    function updateListItems(listEl, results) {
        listEl.innerHTML = "";
        if (results.length === 0) {
            const li = document.createElement("li");
            li.className = "cmdk-item";
            li.textContent = "No commands found";
            listEl.appendChild(li);
            activeIndex = -1;
        } else {
            if (activeIndex >= results.length) activeIndex = results.length - 1;
            if (activeIndex < 0) activeIndex = 0;
            results.forEach((result, index) => {
                if (!result.cmd) return;
                const fullPath = result.breadcrumb.length
                    ? result.breadcrumb.map((b) => b.name).join(" > ") + " > " +
                        result.cmd.name
                    : result.cmd.name;
                const li = document.createElement("li");
                li.className = "cmdk-item" +
                    (index === activeIndex ? " active" : "");
                li.textContent = fullPath +
                    (result.cmd.shortcut ? ` (${result.cmd.shortcut})` : "");
                li.title = `${
                    result.cmd.help || "No help available."
                }\nUsage: ${result.cmd.usage || "Not specified."}`;
                li.addEventListener("click", (e) => {
                    e.stopPropagation();
                    executeCommand(result);
                });
                listEl.appendChild(li);
            });
        }
        scrollActiveIntoView();
    }

    function handleListInputKeyDown(e) {
        const inputEl = shadow.getElementById("cmdk-input");
        const listEl = shadow.getElementById("cmdk-list");
        if (!inputEl || !listEl) return;

        if (e.key === "Escape") {
            e.preventDefault();
            hideCmdk();
            return;
        }
        if (
            e.key === "ArrowDown"
        ) {
            e.preventDefault();
            if (currentFiltered.length) {
                activeIndex = (activeIndex + 1) % currentFiltered.length;
                updateListItems(listEl, currentFiltered);
            }
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentFiltered.length) {
                activeIndex = (activeIndex - 1 + currentFiltered.length) %
                    currentFiltered.length;
                updateListItems(listEl, currentFiltered);
            }
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && currentFiltered[activeIndex]) {
                executeCommand(currentFiltered[activeIndex]);
            }
            return;
        }
        if (
            e.key === "Backspace" && commandStack.length > 1 &&
            inputEl.value === ""
        ) {
            e.preventDefault();
            commandStack.pop();
            currentList = commandStack[commandStack.length - 1];
            activeIndex = 0;
            renderListMode();
        }
    }

    function renderToolMode() {
        if (!currentToolCommand) {
            console.error("renderToolMode called with null currentToolCommand");
            setMode("list");
            return;
        }
        const container = shadow.getElementById("cmdk-container");
        let html = getHeaderHTML() + `
            <div class="tool-container">
                <p><strong>${currentToolCommand.name}</strong>: ${currentToolCommand.help}</p>
                <form id="tool-form">
        `;

        if (currentToolCommand.kwargs) {
            currentToolCommand.kwargs.forEach((kwarg) => {
                const defaultValue = kwarg.default || "";
                const inputType = kwarg.type === "textarea"
                    ? "textarea"
                    : `input type="${kwarg.type}"`;
                html += `
                    <label for="kwarg-${kwarg.name}">${kwarg.name} (${kwarg.help}):</label>
                    ${
                    inputType === "textarea"
                        ? `<textarea id="kwarg-${kwarg.name}" name="${kwarg.name}" class="cmdk-input">${defaultValue}</textarea>`
                        : `<${inputType} id="kwarg-${kwarg.name}" name="${kwarg.name}" value="${defaultValue}" class="cmdk-input">`
                }
                `;
            });
        }

        const textInputType = currentToolCommand.type === "textarea"
            ? "textarea"
            : `input type="${currentToolCommand.type}"`;
        html += `
                    <label for="tool-text">Text:</label>
                    ${
            textInputType === "textarea"
                ? `<textarea id="tool-text" name="text" class="cmdk-input" placeholder="${currentToolCommand.usage}"></textarea>`
                : `<${textInputType} id="tool-text" name="text" class="cmdk-input" placeholder="${currentToolCommand.usage}">`
        }
                    <p id="cmdk-tool-error" style="color: red;"></p>
                    <button type="submit">Execute</button>
                    <button type="button" id="tool-back" class="back-button">Back</button>
                </form>
            </div>
        `;

        container.innerHTML = html;
        attachHeaderEvents();

        const form = shadow.getElementById("tool-form");
        const textInput = shadow.getElementById("tool-text");
        textInput.focus();

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const args = { text: formData.get("text") || "" };
            if (currentToolCommand.kwargs) {
                currentToolCommand.kwargs.forEach((kwarg) => {
                    args[kwarg.name] = formData.get(kwarg.name) ||
                        kwarg.default || "";
                });
            }
            processToolInput(args);
        });

        shadow.getElementById("tool-back").addEventListener(
            "click",
            () => setMode("list"),
        );
    }

    function processToolInput(args) {
        try {
            const output = currentToolCommand.processInput(args);
            currentResult = output;
            setMode("result");
        } catch (err) {
            const errorEl = shadow.getElementById("cmdk-tool-error");
            if (errorEl) errorEl.textContent = err.message;
        }
    }

    function renderResultMode() {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = getHeaderHTML() + `
            <div class="result-container">
                <p>Result for <strong>${
            currentToolCommand?.name || "Result"
        }</strong>:</p>
                <div id="cmdk-result" class="result-box">${currentResult}</div>
                <button id="cmdk-copy">Copy to Clipboard</button>
                <button id="result-back">Back</button>
            </div>
        `;
        attachHeaderEvents();
        shadow.getElementById("cmdk-copy").addEventListener("click", () => {
            navigator.clipboard.writeText(currentResult)
                .then(() => alert("Copied to clipboard!"))
                .catch((err) => alert("Failed to copy: " + err));
        });
        shadow.getElementById("result-back").addEventListener(
            "click",
            () => setMode("list"),
        );
    }

    function renderTodoMode() {
        loadTodoTasks(() => {
            const container = shadow.getElementById("cmdk-container");
            container.innerHTML = getHeaderHTML() + `
                <div class="todo-container">
                    <h3>Advanced To-Do</h3>
                    <input type="text" id="todo-input" class="todo-input" placeholder="Add a new task or link...">
                    <ul id="todo-list" class="todo-list"></ul>
                    <button id="todo-back" class="back-button">Back</button>
                </div>
            `;
            attachHeaderEvents();
            const todoInput = shadow.getElementById("todo-input");
            todoInput.focus();
            todoInput.addEventListener("focusout", () => {
                setTimeout(() => {
                    if (currentMode === "todo" && !shadow.activeElement) {
                        todoInput.focus();
                    }
                }, 0);
            });
            todoInput.addEventListener("keydown", (e) => {
                e.stopPropagation();
                if (e.key === "Enter" && todoInput.value.trim() !== "") {
                    addTodo(todoInput.value.trim());
                    todoInput.value = "";
                    renderTodoList();
                } else if (e.key === "Escape") {
                    setMode("list");
                }
            });
            shadow.getElementById("todo-back").addEventListener(
                "click",
                () => setMode("list"),
            );
            renderTodoList();
        });
    }

    function renderTodoList() {
        const todoListEl = shadow.getElementById("todo-list");
        todoListEl.innerHTML = "";
        todoTasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.className = "todo-item" + (task.completed ? " completed" : "");
            li.innerHTML = `<span>${task.text}</span>`;
            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = task.completed ? "Undo" : "Done";
            toggleBtn.addEventListener("click", () => {
                todoTasks[index].completed = !todoTasks[index].completed;
                saveTodoTasks();
                renderTodoList();
            });
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
                todoTasks.splice(index, 1);
                saveTodoTasks();
                renderTodoList();
            });
            li.appendChild(toggleBtn);
            li.appendChild(deleteBtn);
            todoListEl.appendChild(li);
        });
    }

    function addTodo(taskText) {
        todoTasks.push({ text: taskText, completed: false });
        saveTodoTasks();
    }

    function executeCommand(result) {
        if (!result || (!result.cmd && !result.name)) {
            console.error("executeCommand called with invalid result:", result);
            return;
        }
        const cmd = result.cmd || result;
        const breadcrumb = result.breadcrumb || [];

        if (breadcrumb.length > 0) {
            commandStack = [commands];
            let current = commands;
            for (const b of breadcrumb) {
                if (b.children) {
                    commandStack.push(b.children);
                    current = b.children;
                }
            }
            currentList = current;
        }

        if (cmd.children) {
            commandStack.push(cmd.children);
            currentList = cmd.children;
            activeIndex = 0;
            setMode("list");
        } else if (cmd.requiresInput) {
            currentToolCommand = cmd;
            setMode("tool");
        } else if (cmd.action) {
            if (!cmd.inline) hideCmdk();
            cmd.action();
        }
    }

    function getRegisteredShortcuts(list = commands, prefix = "") {
        let output = "";
        list.forEach((cmd) => {
            if (cmd?.shortcut) {
                output += `${prefix}${cmd.name}: ${cmd.shortcut}\n`;
            }
            if (cmd?.children) {
                output += getRegisteredShortcuts(
                    cmd.children,
                    prefix + cmd.name + " > ",
                );
            }
        });
        return output || "No shortcuts registered.";
    }

    function showRegisteredShortcuts() {
        currentToolCommand = {
            name: "Registered Shortcuts",
            processInput: (body) => body,
        };
        currentResult = "<pre>" + getRegisteredShortcuts() + "</pre>";
        setMode("result");
    }

    document.addEventListener("keydown", (e) => {
        const overlayEl = shadow.getElementById("cmdk-overlay");
        if (!overlayEl.classList.contains("open")) {
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                shortcutBuffer += e.key.toLowerCase();
                clearTimeout(shortcutTimer);
                shortcutTimer = setTimeout(() => {
                    shortcutBuffer = "";
                }, 1000);
                const { exact, partial } = matchShortcut(
                    shortcutBuffer,
                    commands,
                );
                if (exact) {
                    e.preventDefault();
                    if (exact.children) {
                        commandStack = [exact.children];
                        currentList = exact.children;
                        activeIndex = 0;
                        showCmdk();
                    } else if (exact.requiresInput) {
                        showCmdk();
                        currentToolCommand = exact;
                        setMode("tool");
                    } else if (exact.action) {
                        if (!exact.inline) hideCmdk();
                        exact.action();
                    }
                    shortcutBuffer = "";
                    return;
                } else if (!partial) shortcutBuffer = "";
            }
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                showCmdk();
            }
        }
    }, { capture: true });

    const contextCommandMap = {
        "cmdk-base64-encode": "Base64 Tool > Base64 Encode",
        "cmdk-trim-full": "Text Tools > Trim > Full Trim",
        "cmdk-trim-left": "Text Tools > Trim > Trim Left",
        "cmdk-trim-right": "Text Tools > Trim > Trim Right",
        "cmdk-case-up": "Text Tools > Change Case > To Uppercase",
        "cmdk-case-low": "Text Tools > Change Case > To Lowercase",
        "cmdk-case-cap": "Text Tools > Change Case > Capitalize Words",
        "cmdk-rep": "Text Tools > Replace Text",
        "cmdk-split": "Text Tools > Split Text",
        "cmdk-join": "Text Tools > Join Lines",
        "cmdk-count-wc": "Text Tools > Count > Words",
        "cmdk-count-cc": "Text Tools > Count > Characters",
        "cmdk-count-lc": "Text Tools > Count > Lines",
        "cmdk-num-hex": "Number Tools > Decimal to Hex",
        "cmdk-num-dec": "Number Tools > Hex to Decimal",
        "cmdk-num-bin": "Number Tools > Decimal to Binary",
        "cmdk-num-decbin": "Number Tools > Binary to Decimal",
        "cmdk-json-parse": "JSON Tools > Parse JSON",
        "cmdk-json-string": "JSON Tools > Stringify JSON",
        "cmdk-hash": "Hash Tool",
        "cmdk-time-now": "Time Tools > Current Timestamp",
        "cmdk-time-fmt": "Time Tools > Format Timestamp",
        "cmdk-enc-urlenc": "Encode/Decode Tools > URL Encode",
        "cmdk-enc-urldec": "Encode/Decode Tools > URL Decode",
        "cmdk-enc-htmlesc": "Encode/Decode Tools > HTML Escape",
        "cmdk-enc-htmlunesc": "Encode/Decode Tools > HTML Unescape",
        "cmdk-str-rev": "String Tools > Reverse",
        "cmdk-str-sub": "String Tools > Substring",
        "cmdk-todo": "To-Do",
    };

    function searchCommandByPath(path, list) {
        const parts = path.split(">").map((s) => s.trim().toLowerCase());
        let currentList = list;
        let found = null;
        for (const part of parts) {
            found = currentList.find((cmd) =>
                cmd?.name?.toLowerCase() === part
            );
            if (!found) {
                console.error(
                    "No command found for part:",
                    part,
                    "in",
                    currentList.map((c) => c?.name || "undefined"),
                );
                return null;
            }
            currentList = found.children || [];
        }
        return found;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action && request.selection) {
            if (request.action === "cmdk-todo") {
                loadTodoTasks(() => {
                    addTodo(request.selection);
                    alert("Saved to To-Do");
                });
                return;
            }
            const desiredPath = contextCommandMap[request.action];
            if (desiredPath) {
                const cmd = searchCommandByPath(desiredPath, commands);
                if (cmd) {
                    if (cmd.requiresInput) {
                        currentToolCommand = cmd;
                        showCmdk(cmd);
                        setMode("tool");
                        setTimeout(() => {
                            const textInput = shadow.getElementById(
                                "tool-text",
                            );
                            if (textInput) {
                                textInput.value = request.selection;
                                textInput.focus();
                            }
                        }, 100);
                    } else if (cmd.action) {
                        cmd.action();
                    }
                }
            }
        }
    });

    window.showCmdk = showCmdk;
})();
