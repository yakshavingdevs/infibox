export const STORAGE_KEYS = {
  PRIMARY_COLOR: "primaryColor",
  ENABLE_CONTEXT_MENUS: "enableContextMenus",
  TODO_TASKS: "cmdkTodoTasks",
} as const;

export const DEFAULTS = {
  PRIMARY_COLOR: "#0d9488",
  ENABLE_CONTEXT_MENUS: true,
} as const;

export const APP = {
  NAME: "Infibox",
  VERSION: "0.0.1",
  KEYBOARD_SHORTCUT: "Ctrl+Shift+K",
} as const;
