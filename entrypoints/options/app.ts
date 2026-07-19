import { getSettings, saveSettings, getTodoTasks, saveTodoTasks } from "../../src/stores/app";
import type { TodoTask } from "../../src/types/index";

function showToast(message: string, type: "success" | "error" = "success"): void {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

function setupNavigation(): void {
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const viewId = (item as HTMLElement).dataset.view;

      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      views.forEach((view) => view.classList.remove("active"));
      const targetView = document.getElementById(`view-${viewId}`);
      if (targetView) {
        targetView.classList.add("active");
      }
    });
  });
}

function setupPreferences(): void {
  const colorInput = document.getElementById("primary-color") as HTMLInputElement;
  const colorValue = document.getElementById("color-value");
  const contextMenusCheckbox = document.getElementById("enable-context-menus") as HTMLInputElement;
  const settingsForm = document.getElementById("settings-form") as HTMLFormElement;

  if (colorInput && colorValue) {
    colorInput.addEventListener("input", () => {
      colorValue.textContent = colorInput.value;
    });
  }

  async function loadSettings(): Promise<void> {
    try {
      const settings = await getSettings();
      if (colorInput) colorInput.value = settings.primaryColor;
      if (colorValue) colorValue.textContent = settings.primaryColor;
      if (contextMenusCheckbox) contextMenusCheckbox.checked = settings.enableContextMenus;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const newSettings = {
      primaryColor: colorInput?.value || "#0d9488",
      enableContextMenus: contextMenusCheckbox?.checked || false,
    };

    try {
      await saveSettings(newSettings);
      showToast("Settings saved");
    } catch (error) {
      showToast("Failed to save settings", "error");
      console.error("Save error:", error);
    }
  }

  loadSettings();
  settingsForm?.addEventListener("submit", handleSubmit);
}

function setupTodo(): void {
  const todoInput = document.getElementById("todo-input") as HTMLInputElement;
  const todoAddBtn = document.getElementById("todo-add") as HTMLButtonElement;
  const todoList = document.getElementById("todo-list") as HTMLUListElement;
  const todoStats = document.getElementById("todo-stats") as HTMLDivElement;
  const todoEmpty = document.getElementById("todo-empty") as HTMLDivElement;

  let tasks: TodoTask[] = [];

  function render(): void {
    if (!todoList || !todoStats || !todoEmpty) return;

    todoList.innerHTML = "";

    const completedCount = tasks.filter((t) => t.completed).length;

    if (tasks.length === 0) {
      todoStats.classList.remove("visible");
      todoEmpty.classList.add("visible");
    } else {
      todoStats.classList.add("visible");
      todoStats.innerHTML = `
        <span>${completedCount} of ${tasks.length} completed</span>
        ${completedCount > 0 ? '<button class="clear-completed">Clear completed</button>' : ""}
      `;

      const clearBtn = todoStats.querySelector(".clear-completed");
      if (clearBtn) {
        clearBtn.addEventListener("click", clearCompleted);
      }

      todoEmpty.classList.remove("visible");

      tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "todo-item";

        const checkbox = document.createElement("button");
        checkbox.className = `todo-checkbox ${task.completed ? "checked" : ""}`;
        checkbox.innerHTML = task.completed
          ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>'
          : "";
        checkbox.addEventListener("click", () => toggleTask(index));

        const text = document.createElement("span");
        text.className = `todo-text ${task.completed ? "completed" : ""}`;
        text.textContent = task.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "todo-delete";
        deleteBtn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>';
        deleteBtn.addEventListener("click", () => deleteTask(index));

        li.append(checkbox, text, deleteBtn);
        todoList.appendChild(li);
      });
    }
  }

  async function loadTasks(): Promise<void> {
    try {
      tasks = await getTodoTasks();
      render();
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }

  async function save(): Promise<void> {
    try {
      await saveTodoTasks(tasks);
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }

  function addTask(): void {
    const text = todoInput?.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    todoInput.value = "";
    save();
    render();
    showToast("Task added");
  }

  function toggleTask(index: number): void {
    tasks[index].completed = !tasks[index].completed;
    save();
    render();
  }

  function deleteTask(index: number): void {
    tasks.splice(index, 1);
    save();
    render();
    showToast("Task removed");
  }

  function clearCompleted(): void {
    tasks = tasks.filter((t) => !t.completed);
    save();
    render();
    showToast("Completed tasks cleared");
  }

  todoInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  todoAddBtn?.addEventListener("click", addTask);

  loadTasks();
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupPreferences();
  setupTodo();
});
