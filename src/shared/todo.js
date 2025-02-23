import { globalState } from "../content/state";
import { setRenderMode } from "../content/render";
import { shadow } from "../content/shadow";
import { getHeaderHTML, attachHeaderEvents } from "../content/header";

export function saveTodoTasks() {
  chrome.storage.local.set({ cmdkTodoTasks: globalState.todoTasks });
}

export function addTodo(taskText) {
  globalState.todoTasks.push({ text: taskText, completed: false });
  saveTodoTasks();
}

export function loadTodoTasks(callback) {
  chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
      globalState.todoTasks = result.cmdkTodoTasks || [];
      if (callback) callback();
  });
}

export function renderTodoList() {
  const todoListEl = shadow.getElementById("todo-list");
  todoListEl.innerHTML = "";
  globalState.todoTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (task.completed ? " completed" : "");
      li.innerHTML = `<span>${task.text}</span>`;
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = task.completed ? "Undo" : "Done";
      toggleBtn.addEventListener("click", () => {
          globalState.todoTasks[index].completed = !globalState.todoTasks[index].completed;
          saveTodoTasks();
          renderTodoList();
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
          globalState.todoTasks.splice(index, 1);
          saveTodoTasks();
          renderTodoList();
      });
      li.appendChild(toggleBtn);
      li.appendChild(deleteBtn);
      todoListEl.appendChild(li);
  });
}

export function renderTodoMode() {
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
              if (globalState.currentMode === "todo" && !shadow.activeElement) {
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
              setRenderMode("list");
          }
      });
      shadow.getElementById("todo-back").addEventListener(
          "click",
          () => setRenderMode("list"),
      );
      renderTodoList();
  });
}