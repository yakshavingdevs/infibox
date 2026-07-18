import type { GlobalState } from "../../src/types";

export const initialState: GlobalState = {
  currentMode: "list",
  commandStack: [],
  currentList: [],
  activeIndex: 0,
  currentFiltered: [],
  currentToolCommand: null,
  currentResult: "",
  todoTasks: [],
  shortcutBuffer: "",
  shortcutTimer: undefined,
};

export let globalState: GlobalState = { ...initialState };

export function resetCmdkState(): void {
  globalState = { ...initialState };
};
