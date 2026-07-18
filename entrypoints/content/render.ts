import type { Mode } from "../../src/types";
import { globalState } from "./state";
import { shadow } from "./shadow";
import { renderListMode } from "./modes/list";
import { renderToolMode } from "./modes/tool";
import { renderResultMode  } from "./modes/result";
import { renderTodoMode } from "./todo";

function render(): void {
  const container = shadow.getElementById("cmdk-container");
  if (!container) return;
  container.innerHTML = "";
  if (globalState.currentMode === "list") renderListMode();
  else if (globalState.currentMode === "tool") renderToolMode();
  else if (globalState.currentMode === "result") renderResultMode();
  else if (globalState.currentMode === "todo") renderTodoMode();
}

export function setRenderMode(mode: Mode): void {
  globalState.currentMode = mode;
  render();
}
