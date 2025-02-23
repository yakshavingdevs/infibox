import { globalState } from "./state";
import { setRenderMode } from "./render";
import { defaultCommands } from "./commands";
import { shadow } from "./shadow";

export function getHeaderHTML() {
  return `
      <div class="cmdk-header">
          <button id="home-button" class="home-button">Home</button>
          <div class="cmdk-hints">
              Enter: Submit • ↑/↓ or Ctrl+N/Ctrl+P: Navigate • Esc: Cancel • Backspace: Back • ?: Help
          </div>
      </div>
  `;
}

export function attachHeaderEvents() {
  const homeButton = shadow.getElementById("home-button");
  if (homeButton) {
      homeButton.addEventListener("click", (e) => {
          e.stopPropagation();
          globalState.commandStack = [defaultCommands];
          globalState.currentList = defaultCommands;
          globalState.activeIndex = 0;
          setRenderMode("list");
      });
  }
}