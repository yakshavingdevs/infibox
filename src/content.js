// contentScript.js
(() => {
    /************************************************
     * Create a Shadow DOM Container for Isolation
     ************************************************/
    const containerDiv = document.createElement("div");
    containerDiv.id = "cmdk-extension-container";
    const shadow = containerDiv.attachShadow({ mode: "open" });
    document.documentElement.appendChild(containerDiv);

    /************************************************
     * Inject CMDK HTML & CSS into the Shadow DOM
     ************************************************/
    const cmdkHTML = `
      <div id="cmdk-overlay" class="cmdk-overlay">
        <div class="cmdk-container fade-in" id="cmdk-container">
          <!-- CMDK dynamic content will be injected here -->
        </div>
      </div>
    `;
    // Note: insertAdjacentHTML isn’t available on ShadowRoot, so we use innerHTML.
    shadow.innerHTML = cmdkHTML;
    const style = document.createElement("style");
    style.textContent = `
      /* All CMDK CSS is scoped inside the Shadow DOM */
      :host { all: initial; }
      .cmdk-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.75);
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        z-index: 10000;
      }
      .cmdk-overlay.open { opacity: 1; pointer-events: auto; }
      .cmdk-container {
        background: #fff; color: #000; border-radius: 8px;
        width: 520px; max-height: 85vh; overflow-y: auto;
        box-shadow: 0 6px 30px rgba(0,0,0,0.4);
        transform: translateY(-20px); transition: transform 0.3s ease;
      }
      .cmdk-overlay.open .cmdk-container { transform: translateY(0); }
      .fade-in { animation: fadeIn 0.3s ease; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      /* Custom Scrollbar */
      .cmdk-container::-webkit-scrollbar { width: 6px; }
      .cmdk-container::-webkit-scrollbar-track { background: #f0f0f0; }
      .cmdk-container::-webkit-scrollbar-thumb { background: #000; border-radius: 3px; }
      .cmdk-container { scrollbar-width: thin; scrollbar-color: #000 #f0f0f0; }
      /* Header */
      .cmdk-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px; background: #eee; border-bottom: 1px solid #ccc;
      }
      .home-button {
        background: #000; color: #fff; border: none; padding: 8px 12px;
        cursor: pointer; border-radius: 4px; font-size: 14px;
      }
      .home-button:hover { background: #333; }
      .cmdk-hints { font-size: 13px; color: #555; text-align: right; }
      /* List Mode */
      .cmdk-input {
        width: 100%; padding: 16px; font-size: 18px;
        border: none; border-bottom: 1px solid #ccc;
        box-sizing: border-box; outline: none;
      }
      .cmdk-list { list-style: none; margin: 0; padding: 0;
        max-height: 300px; overflow-y: auto;
      }
      .cmdk-item { padding: 14px 16px; cursor: pointer; transition: background 0.2s; }
      .cmdk-item:hover, .cmdk-item.active { background: #f0f0f0; }
      /* Tool/Result/Add Action/To-Do Modes */
      .tool-container, .result-container, .add-action-container, .todo-container {
        padding: 20px 24px;
      }
      .tool-container p, .result-container p, .todo-container p { margin-top: 0; }
      .cmdk-input, .todo-input {
        padding: 14px; font-size: 16px;
        border: 1px solid #ccc; border-radius: 4px;
        box-sizing: border-box; outline: none; width: 100%;
      }
      .result-box {
        padding: 14px; background: #f9f9f9; border: 1px solid #ccc;
        margin-bottom: 20px; word-break: break-all; font-size: 16px;
      }
      /* Buttons */
      button {
        background: #000; color: #fff; border: 1px solid #000;
        padding: 10px 14px; cursor: pointer; margin-right: 10px;
        transition: background 0.2s, color 0.2s;
        border-radius: 4px; font-size: 14px;
      }
      button:hover { background: #fff; color: #000; }
      .back-button {
        background: transparent; border: none; color: #000;
        font-size: 15px; cursor: pointer; text-decoration: underline;
        margin-top: 10px;
      }
      .back-button:hover { color: #555; }
      /* Add Action Mode */
      .add-action-form {
        display: grid; grid-template-columns: 1fr; grid-gap: 15px;
      }
      .add-action-form label { display: block; font-size: 14px; margin-bottom: 5px; }
      .add-action-form input[type="text"], .add-action-form textarea {
        width: 100%; padding: 12px; border: 1px solid #ccc;
        border-radius: 4px; box-sizing: border-box; font-size: 15px;
      }
      .add-action-form textarea {
        background: #2d2d2d; color: #f8f8f2;
        font-family: 'Courier New', Courier, monospace; resize: vertical; min-height: 150px;
      }
      .highlighted-code {
        background: #2d2d2d; color: #f8f8f2; padding: 12px;
        border-radius: 4px; font-family: 'Courier New', Courier, monospace;
        white-space: pre-wrap; overflow-x: auto; margin-top: 10px; font-size: 14px;
      }
      /* To-Do Styles */
      .todo-list { list-style: none; padding: 0; margin: 10px 0; }
      .todo-item {
        display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #ccc;
        font-size: 16px;
      }
      .todo-item.completed { text-decoration: line-through; color: #888; }
      .todo-item button {
        margin-left: auto; background: #fff; color: #000;
        border: 1px solid #000; font-size: 13px;
      }
      .todo-item button:hover { background: #000; color: #fff; }
    `;
    shadow.appendChild(style);

    /******** Global Variables & CMDK State ********/
    let currentMode = "list"; // Modes: list, tool, result, addAction, todo
    let commandStack = [];
    let currentList = [];
    let activeIndex = 0;
    let currentFiltered = [];
    let currentToolCommand = null;
    let currentResult = "";
    let todoTasks = [];

    // Global shortcut buffer for multi-character shortcuts.
    let shortcutBuffer = "";
    let shortcutTimer;

    /******** Command Data Structure ********/
    const defaultCommands = [
        {
            name: "Open Twitter",
            shortcut: "tw",
            action: () => {
                hideCmdk();
                window.open("https://twitter.com", "_blank");
            },
        },
        {
            name: "Theme",
            shortcut: "theme",
            children: [
                {
                    name: "Dark Mode",
                    shortcut: "dark",
                    action: () => {
                        hideCmdk();
                        alert("Switched to Dark Mode!");
                    },
                },
                {
                    name: "Light Mode",
                    shortcut: "light",
                    action: () => {
                        hideCmdk();
                        alert("Switched to Light Mode!");
                    },
                },
            ],
        },
        {
            name: "Base64 Tool",
            shortcut: "b64",
            children: [
                {
                    name: "Base64 Encode",
                    shortcut: "enc",
                    requiresInput: true,
                    processInput: (body) => {
                        if (!body) throw new Error("Input cannot be empty.");
                        try {
                            return btoa(body);
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
                    processInput: (body) => {
                        if (!body) throw new Error("Input cannot be empty.");
                        try {
                            return atob(body);
                        } catch (err) {
                            throw new Error("Invalid Base64 input.");
                        }
                    },
                },
            ],
        },
        {
            name: "Say Hello",
            shortcut: "hello",
            action: () => {
                hideCmdk();
                alert("Hello!");
            },
        },
        {
            name: "Registered Shortcuts",
            shortcut: "shortcuts",
            inline: true,
            action: showRegisteredShortcuts,
        },
        {
            name: "Advanced To-Do",
            shortcut: "todo",
            inline: true,
            action: () => setMode("todo"),
        },
        {
            name: "Trim",
            shortcut: "trim",
            children: [
                {
                    name: "Full Trim",
                    shortcut: "full",
                    requiresInput: true,
                    processInput: (body) => body.trim(),
                },
                {
                    name: "Trim Left",
                    shortcut: "left",
                    requiresInput: true,
                    processInput: (body) => body.replace(/^\s+/, ""),
                },
                {
                    name: "Trim Right",
                    shortcut: "right",
                    requiresInput: true,
                    processInput: (body) => body.replace(/\s+$/, ""),
                },
            ],
        },
        {
            name: "Add Action",
            shortcut: "add",
            requiresInput: true,
            openAddAction: true,
        },
    ];
    let commands = []; // This will be defaultCommands merged with any stored custom actions.

    /******** Storage Functions for To-Do and Custom Actions ********/
    function loadTodoTasks(callback) {
        chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
            todoTasks = result.cmdkTodoTasks || [];
            if (callback) callback();
        });
    }
    function saveTodoTasks() {
        chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
    }

    function loadCustomActions(callback) {
        chrome.storage.local.get(["cmdkCustomActions"], (result) => {
            const customActions = result.cmdkCustomActions || [];
            callback(customActions);
        });
    }
    function saveCustomActions(customActions) {
        chrome.storage.local.set({ cmdkCustomActions: customActions });
    }

    /******** Helper Functions & CMDK Rendering ********/
    function getHeaderHTML() {
        return `
        <div class="cmdk-header">
          <button id="home-button" class="home-button">Home</button>
          <div class="cmdk-hints">
            Enter: Select • ↑/↓ or Ctrl+N/Ctrl+P: Navigate • Esc: Cancel • Backspace: Back
          </div>
        </div>
      `;
    }
    function attachHeaderEvents() {
        const homeButton = shadow.getElementById("home-button");
        if (homeButton) {
            homeButton.addEventListener("click", () => {
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
            if (cmd.name.toLowerCase().includes(query.toLowerCase())) {
                results.push({ cmd, breadcrumb: [...breadcrumb] });
            }
            if (cmd.children) {
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
            if (cmd.shortcut) {
                const sc = cmd.shortcut.toLowerCase();
                if (sc === buffer) {
                    exact = cmd;
                    break;
                } else if (sc.startsWith(buffer)) partial = true;
            }
            if (cmd.children) {
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

    function initCmdk() {
        // Load custom actions then merge with default commands.
        loadCustomActions((customActions) => {
            commands = defaultCommands.concat(customActions);
            commandStack = [commands];
            currentList = commands;
            activeIndex = 0;
            currentFiltered = currentList;
            setMode("list");
        });
    }

    function setMode(mode) {
        currentMode = mode;
        render();
    }

    function showCmdk() {
        shadow.getElementById("cmdk-overlay").classList.add("open");
        initCmdk();
    }

    function hideCmdk() {
        shadow.getElementById("cmdk-overlay").classList.remove("open");
    }

    function render() {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = "";
        if (currentMode === "list") renderListMode();
        else if (currentMode === "tool") renderToolMode();
        else if (currentMode === "result") renderResultMode();
        else if (currentMode === "addAction") renderAddActionMode();
        else if (currentMode === "todo") renderTodoMode();
    }

    function renderListMode(filter = "") {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = getHeaderHTML() + `
        <input type="text" id="cmdk-input" class="cmdk-input" placeholder="Type a command...">
        <ul id="cmdk-list" class="cmdk-list"></ul>
      `;
        attachHeaderEvents();
        const inputEl = shadow.getElementById("cmdk-input");
        inputEl.value = filter || "";
        const listEl = shadow.getElementById("cmdk-list");
        inputEl.focus();

        let results = (filter.trim() === "")
            ? currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
            : globalSearch(filter, commands, []);
        currentFiltered = results;
        if (results.length === 0) {
            const li = document.createElement("li");
            li.className = "cmdk-item";
            li.textContent = "No commands found";
            listEl.appendChild(li);
            activeIndex = -1;
        } else {
            if (activeIndex >= results.length) activeIndex = 0;
            results.forEach((result, index) => {
                const fullPath = result.breadcrumb.length
                    ? result.breadcrumb.map((b) => b.name).concat(
                        result.cmd.name,
                    ).join(" > ")
                    : result.cmd.name;
                const li = document.createElement("li");
                li.className = "cmdk-item" +
                    (index === activeIndex ? " active" : "");
                li.textContent = fullPath +
                    (result.cmd.shortcut
                        ? " (" + result.cmd.shortcut + ")"
                        : "");
                li.addEventListener("click", () => executeCommand(result));
                listEl.appendChild(li);
            });
        }
        scrollActiveIntoView();

        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && inputEl.value === "") {
                e.preventDefault();
                if (commandStack.length > 1) {
                    commandStack.pop();
                    currentList = commandStack[commandStack.length - 1];
                    activeIndex = 0;
                    renderListMode();
                }
            }
        });
        inputEl.addEventListener("input", (e) => {
            activeIndex = 0;
            renderListMode(e.target.value);
        });
    }

    function renderToolMode() {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = getHeaderHTML() + `
        <div class="tool-container">
          <p>Enter text for <strong>${currentToolCommand.name}</strong>:</p>
          <input type="text" id="cmdk-tool-input" class="cmdk-input" placeholder="Type input...">
          <p id="cmdk-tool-error" style="color: red;"></p>
          <button id="tool-back" class="back-button">Back</button>
        </div>
      `;
        attachHeaderEvents();
        const toolInput = shadow.getElementById("cmdk-tool-input");
        toolInput.focus();
        toolInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") processToolInput(toolInput.value);
            else if (e.key === "Escape") setMode("list");
            else if (e.key === "Backspace" && toolInput.value === "") {
                e.preventDefault();
                setMode("list");
            }
        });
        shadow.getElementById("tool-back").addEventListener(
            "click",
            () => setMode("list"),
        );
    }

    function processToolInput(inputValue) {
        try {
            const output = currentToolCommand.processInput(inputValue);
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
            currentToolCommand.name || "Result"
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

    function renderAddActionMode() {
        const container = shadow.getElementById("cmdk-container");
        container.innerHTML = getHeaderHTML() + `
        <div class="add-action-container">
          <h3>Add New Action</h3>
          <form id="cmdk-add-action-form" class="add-action-form">
            <div>
              <label>Action Name:</label>
              <input type="text" name="name" required>
            </div>
            <div>
              <label>Shortcut (any string):</label>
              <input type="text" name="shortcut">
            </div>
            <div>
              <label>Code (function body; parameter: body):</label>
              <textarea name="code" required placeholder="// e.g., console.log(body); return 'Done';"></textarea>
            </div>
            <div>
              <button type="submit">Add Action</button>
              <button type="button" id="add-back" class="back-button">Back</button>
            </div>
          </form>
          <div id="cmdk-add-error" style="color: red; margin-top: 10px;"></div>
          <div class="highlighted-code" id="code-preview" style="display:none;"></div>
        </div>
      `;
        attachHeaderEvents();
        const form = shadow.getElementById("cmdk-add-action-form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const name = formData.get("name").trim();
            const shortcut = formData.get("shortcut").trim();
            const code = formData.get("code");
            try {
                const func = new Function("body", code);
                const newAction = {
                    name,
                    shortcut: shortcut || undefined,
                    requiresInput: true,
                    processInput: func,
                };
                // Save the custom action.
                chrome.storage.local.get(["cmdkCustomActions"], (result) => {
                    let customActions = result.cmdkCustomActions || [];
                    customActions.push(newAction);
                    chrome.storage.local.set({
                        cmdkCustomActions: customActions,
                    }, () => {
                        alert("New action added successfully!");
                        setMode("list");
                    });
                });
            } catch (err) {
                shadow.getElementById("cmdk-add-error").textContent =
                    "Error in code: " + err.message;
            }
        });
        shadow.getElementById("add-back").addEventListener(
            "click",
            () => setMode("list"),
        );
        const textarea = form.querySelector('textarea[name="code"]');
        textarea.addEventListener("blur", () => {
            const preview = shadow.getElementById("code-preview");
            preview.style.display = "block";
            preview.textContent = textarea.value;
        });
        textarea.addEventListener("focus", () => {
            shadow.getElementById("code-preview").style.display = "none";
        });
        form.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                const activeEl = document.activeElement;
                if (
                    (activeEl.tagName === "INPUT" ||
                        activeEl.tagName === "TEXTAREA") &&
                    activeEl.value !== ""
                ) return;
                e.preventDefault();
                setMode("list");
            }
        });
    }

    function renderTodoMode() {
        chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
            todoTasks = result.cmdkTodoTasks || [];
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
            todoInput.addEventListener("keydown", (e) => {
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
                chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
                renderTodoList();
            });
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
                todoTasks.splice(index, 1);
                chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
                renderTodoList();
            });
            li.appendChild(toggleBtn);
            li.appendChild(deleteBtn);
            todoListEl.appendChild(li);
        });
    }

    function addTodo(taskText) {
        todoTasks.push({ text: taskText, completed: false });
        chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
    }

    function executeCommand(result) {
        let cmd, breadcrumb;
        if (result.cmd) {
            cmd = result.cmd;
            breadcrumb = result.breadcrumb;
        } else {
            cmd = result;
            breadcrumb = [];
        }
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
            if (cmd.openAddAction) setMode("addAction");
            else {
                currentToolCommand = cmd;
                setMode("tool");
            }
        } else if (cmd.action) {
            if (!cmd.inline) hideCmdk();
            cmd.action();
        }
    }

    function getRegisteredShortcuts(list = commands, prefix = "") {
        let output = "";
        list.forEach((cmd) => {
            if (cmd.shortcut) {
                output += `${prefix}${cmd.name}: ${cmd.shortcut}\n`;
            }
            if (cmd.children) {
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
        if (overlayEl.classList.contains("open")) {
            if (currentMode === "list") {
                const inputEl = shadow.getElementById("cmdk-input");
                if (!inputEl) return;
                if (e.key === "Escape") {
                    hideCmdk();
                    return;
                }
                if (
                    e.key === "ArrowDown" ||
                    (e.ctrlKey && e.key.toLowerCase() === "n")
                ) {
                    e.preventDefault();
                    if (currentFiltered.length) {
                        activeIndex = (activeIndex + 1) %
                            currentFiltered.length;
                        renderListMode(inputEl.value);
                    }
                    return;
                }
                if (
                    e.key === "ArrowUp" ||
                    (e.ctrlKey && e.key.toLowerCase() === "p")
                ) {
                    e.preventDefault();
                    if (currentFiltered.length) {
                        activeIndex =
                            (activeIndex - 1 + currentFiltered.length) %
                            currentFiltered.length;
                        renderListMode(inputEl.value);
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
            }
        } else {
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
                        if (exact.openAddAction) setMode("addAction");
                        else {
                            currentToolCommand = exact;
                            setMode("tool");
                        }
                    } else if (exact.action) {
                        if (!exact.inline) hideCmdk();
                        exact.action();
                    }
                    shortcutBuffer = "";
                    return;
                } else if (!partial) shortcutBuffer = "";
            }
            if (e.ctrlKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                showCmdk();
            }
        }
    });

    /******** Context Menu Integration ********/
    const contextCommandMap = {
        "cmdk-base64-encode": "Base64 Encode",
        "cmdk-trim-full": "Full Trim",
        "cmdk-trim-left": "Trim Left",
        "cmdk-trim-right": "Trim Right",
        "cmdk-save-link": "Save Link to To-Do",
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action && request.selection) {
            if (request.action === "cmdk-save-link") {
                // Only process if the selection looks like a link.
                if (request.selection.startsWith("http")) {
                    loadTodoTasks(() => {
                        addTodo(request.selection);
                        alert("Link saved to To-Do");
                    });
                } else {
                    alert("Selected text is not a valid link.");
                }
                return; // Exit early for this action.
            }
            let desiredName = contextCommandMap[request.action];
            if (desiredName) {
                function searchCommand(list) {
                    for (const cmd of list) {
                        if (
                            cmd.name.toLowerCase() === desiredName.toLowerCase()
                        ) return cmd;
                        if (cmd.children) {
                            const found = searchCommand(cmd.children);
                            if (found) return found;
                        }
                    }
                    return null;
                }
                const cmd = searchCommand(commands);
                if (cmd) {
                    if (cmd.requiresInput) {
                        currentToolCommand = cmd;
                        showCmdk();
                        setMode("tool");
                        setTimeout(() => {
                            const toolInput = shadow.getElementById(
                                "cmdk-tool-input",
                            );
                            if (toolInput) toolInput.value = request.selection;
                        }, 100);
                    } else {
                        cmd.action();
                    }
                }
            }
        }
    });

    window.showCmdk = showCmdk;
})();
