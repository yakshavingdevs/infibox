(() => {
    const shadow = window.__CMDK_SHADOW_ROOT__;
    if (!shadow) return;

    chrome.storage.local.get({ primaryColor: "#000000" }, (settings) => {
        shadow.host.style.setProperty("--primary", settings.primaryColor);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && "primaryColor" in changes) {
            shadow.host.style.setProperty("--primary", changes.primaryColor.newValue);
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
                            throw new Error("Invalid input for Base64 encoding.");
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
            name: "To-Do",
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
    ];

    let commands = defaultCommands;

    function loadTodoTasks(callback) {
        chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
            todoTasks = result.cmdkTodoTasks || [];
            if (callback) callback();
        });
    }
    function saveTodoTasks() {
        chrome.storage.local.set({ cmdkTodoTasks: todoTasks });
    }

    function getHeaderHTML() {
        return `
            <div class="cmdk-header">
                <button id="home-button" class="home-button">Home</button>
                <div class="cmdk-hints">
                    Enter: Select • ↑/↓ : Navigate • Esc: Cancel • Backspace: Back
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
                results = results.concat(globalSearch(query, cmd.children, [...breadcrumb, cmd]));
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
                const { exact: childExact, partial: childPartial } = matchShortcut(buffer, cmd.children);
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
            <input type="text" id="cmdk-input" class="cmdk-input" placeholder="Type a command...">
            <ul id="cmdk-list" class="cmdk-list"></ul>
        `;
        attachHeaderEvents();
        const inputEl = shadow.getElementById("cmdk-input");
        inputEl.value = filter || "";
        inputEl.focus();
        inputEl.addEventListener("keydown", handleListInputKeyDown);
        const listEl = shadow.getElementById("cmdk-list");
        let results = (filter.trim() === "")
            ? currentList.map((cmd) => ({ cmd, breadcrumb: [] }))
            : globalSearch(filter, commands, []);
        currentFiltered = results;
        updateListItems(listEl, results);
        inputEl.addEventListener("input", (e) => {
            activeIndex = 0;
            results = (e.target.value.trim() === "")
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
                    ? result.breadcrumb.map((b) => b.name).join(" > ") + " > " + result.cmd.name
                    : result.cmd.name;
                const li = document.createElement("li");
                li.className = "cmdk-item" + (index === activeIndex ? " active" : "");
                li.textContent = fullPath + (result.cmd.shortcut ? " (" + result.cmd.shortcut + ")" : "");
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
        if (e.key === "ArrowDown") {
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
                activeIndex = (activeIndex - 1 + currentFiltered.length) % currentFiltered.length;
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
        if (e.key === "Backspace" && commandStack.length > 1 && inputEl.value === "") {
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
        container.innerHTML = getHeaderHTML() + `
            <div class="tool-container">
                <p>Enter text for <strong>${currentToolCommand.name || "Unknown Tool"}</strong>:</p>
                <input type="text" id="cmdk-tool-input" class="cmdk-input" placeholder="Type input...">
                <p id="cmdk-tool-error" style="color: red;"></p>
                <button id="tool-back" class="back-button">Back</button>
            </div>
        `;
        attachHeaderEvents();
        const toolInput = shadow.getElementById("cmdk-tool-input");
        toolInput.focus();
        toolInput.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") processToolInput(toolInput.value);
            else if (e.key === "Escape") setMode("list");
            else if (e.key === "Backspace" && toolInput.value === "") {
                e.preventDefault();
                setMode("list");
            }
        });
        shadow.getElementById("tool-back").addEventListener("click", () => setMode("list"));
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
                <p>Result for <strong>${currentToolCommand?.name || "Result"}</strong>:</p>
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
        shadow.getElementById("result-back").addEventListener("click", () => setMode("list"));
    }

    function renderTodoMode() {
        loadTodoTasks(() => {
            const container = shadow.getElementById("cmdk-container");
            container.innerHTML = getHeaderHTML() + `
                <div class="todo-container">
                    <h3>To-Do</h3>
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
            shadow.getElementById("todo-back").addEventListener("click", () => setMode("list"));
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
                output += getRegisteredShortcuts(cmd.children, prefix + cmd.name + " > ");
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
                const { exact, partial } = matchShortcut(shortcutBuffer, commands);
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
        "cmdk-trim-full": "Trim > Full Trim",
        "cmdk-trim-left": "Trim > Trim Left",
        "cmdk-trim-right": "Trim > Trim Right",
        "cmdk-save-link": "To-Do",
    };

    function searchCommandByPath(path, list) {
        const parts = path.split(">").map((s) => s.trim().toLowerCase());
        let currentList = list;
        let found = null;
        for (const part of parts) {
            found = currentList.find((cmd) => cmd?.name?.toLowerCase() === part);
            if (!found) {
                console.error("No command found for part:", part, "in", currentList.map((c) => c?.name || "undefined"));
                return null;
            }
            currentList = found.children || [];
        }
        return found;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action && request.selection) {
            if (request.action === "cmdk-save-link") {
                if (request.selection.startsWith("http")) {
                    loadTodoTasks(() => {
                        addTodo(request.selection);
                        alert("Link saved to To-Do");
                    });
                } else {
                    alert("Selected text is not a valid link.");
                }
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
                            const toolInput = shadow.getElementById("cmdk-tool-input");
                            if (toolInput) {
                                toolInput.value = request.selection;
                                toolInput.focus();
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