import { createStore } from "solid-js/store";
import { createEffect, createRoot, on } from "solid-js";
import type { Command, Mode, TodoTask } from "../types";
import { STORAGE_KEYS, DEFAULTS } from "../constants";

export interface Settings {
  primaryColor: string;
  enableContextMenus: boolean;
}

export function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        [STORAGE_KEYS.PRIMARY_COLOR]: DEFAULTS.PRIMARY_COLOR,
        [STORAGE_KEYS.ENABLE_CONTEXT_MENUS]: DEFAULTS.ENABLE_CONTEXT_MENUS,
      },
      (items) => resolve(items as Settings),
    );
  });
}

export function saveSettings(settings: Settings): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(settings, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export function getTodoTasks(): Promise<TodoTask[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.TODO_TASKS], (result) => {
      resolve((result[STORAGE_KEYS.TODO_TASKS] as TodoTask[]) || []);
    });
  });
}

export function saveTodoTasks(tasks: TodoTask[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.TODO_TASKS]: tasks }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// ========================================================================
// SolidJS reactive store — wraps storage with auto-sync + transient state
// ========================================================================

export interface AppState {
  settings: Settings;
  todoTasks: TodoTask[];
  mode: Mode;
  commandStack: Command[][];
  currentList: Command[];
  currentToolCommand: Command | null;
  currentResult: string;
  prefill: string;
}

const DEFAULT_STATE: AppState = {
  settings: { primaryColor: DEFAULTS.PRIMARY_COLOR, enableContextMenus: DEFAULTS.ENABLE_CONTEXT_MENUS },
  todoTasks: [],
  mode: "list",
  commandStack: [],
  currentList: [],
  currentToolCommand: null,
  currentResult: "",
  prefill: "",
};

let _state!: AppState;
let _setState!: (setter: AppState | ((prev: AppState) => AppState)) => AppState;

createRoot(() => {
  const [state, setState] = createStore<AppState>({ ...DEFAULT_STATE });
  _state = state;
  _setState = setState;
});

export async function initStore(): Promise<void> {
  const [settings, todoTasks] = await Promise.all([
    getSettings(),
    getTodoTasks(),
  ]);

  _setState((prev) => ({
    ...prev,
    settings,
    todoTasks,
  }));

  setupPersistence();
}

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

function setupPersistence(): void {
  createRoot(() => {
    const sync = debounce(() => saveSettings({ ..._state.settings }), 300);

    createEffect(
      on(
        () => [_state.settings.primaryColor, _state.settings.enableContextMenus] as const,
        sync,
        { defer: true },
      ),
    );
  });

  createRoot(() => {
    const sync = debounce(() => saveTodoTasks([..._state.todoTasks]), 300);

    createEffect(
      on(
        () => _state.todoTasks,
        sync,
        { defer: true },
      ),
    );
  });
}

export function getState(): AppState {
  return _state;
}

// ---- Actions ----

export function setMode(mode: Mode): void {
  _setState((prev) => ({ ...prev, mode }));
}

export function setCurrentResult(result: string): void {
  _setState((prev) => ({ ...prev, currentResult: result }));
}

export function setCurrentToolCommand(cmd: Command | null): void {
  _setState((prev) => ({ ...prev, currentToolCommand: cmd }));
}

export function setPrefill(text: string): void {
  _setState((prev) => ({ ...prev, prefill: text }));
}

export function setCommandStack(stack: Command[][]): void {
  _setState((prev) => ({ ...prev, commandStack: stack }));
}

export function setCurrentList(list: Command[]): void {
  _setState((prev) => ({ ...prev, currentList: list }));
}

export function addTodoTask(task: TodoTask): void {
  _setState((prev) => ({
    ...prev,
    todoTasks: [...prev.todoTasks, task],
  }));
}
