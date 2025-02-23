export const initialState = {
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

export let globalState = { ...initialState };

export function resetCmdkState() {
  globalState = { ...initialState };
};
