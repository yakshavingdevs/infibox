import { globalState } from "../state";
import { setRenderMode } from "../render";
import { shadow } from "../shadow";
import { getHeaderHTML, attachHeaderEvents } from "../header";

export function processToolInput(args) {
  try {
    const output = globalState.currentToolCommand.processInput(args);
    globalState.currentResult = output;
    setRenderMode("result");
  } catch (err) {
    const errorEl = shadow.getElementById("cmdk-tool-error");
    if (errorEl) errorEl.textContent = err.message;
  }
}

export function renderToolMode() {
  if (!globalState.currentToolCommand) {
    console.error("renderToolMode called with null globalState.currentToolCommand");
    setRenderMode("list");
    return;
  }
  const container = shadow.getElementById("cmdk-container");
  let html = getHeaderHTML() + `
            <div class="tool-container">
                <p><strong>${globalState.currentToolCommand.name}</strong>: ${globalState.currentToolCommand.help}</p>
                <form id="tool-form">
        `;

  if (globalState.currentToolCommand.kwargs) {
    globalState.currentToolCommand.kwargs.forEach((kwarg) => {
      const defaultValue = kwarg.default || "";
      const inputType = kwarg.type === "textarea"
        ? "textarea"
        : `input type="${kwarg.type}"`;
      html += `
                    <label for="kwarg-${kwarg.name}">${kwarg.name} (${kwarg.help}):</label>
                    ${inputType === "textarea"
          ? `<textarea id="kwarg-${kwarg.name}" name="${kwarg.name}" class="cmdk-input">${defaultValue}</textarea>`
          : `<${inputType} id="kwarg-${kwarg.name}" name="${kwarg.name}" value="${defaultValue}" class="cmdk-input">`
        }
                `;
    });
  }

  const textInputType = globalState.currentToolCommand.type === "textarea"
    ? "textarea"
    : `input type="${globalState.currentToolCommand.type}"`;
  html += `
                    <label for="tool-text">Text:</label>
                    ${textInputType === "textarea"
      ? `<textarea id="tool-text" name="text" class="cmdk-input" placeholder="${globalState.currentToolCommand.usage}"></textarea>`
      : `<${textInputType} id="tool-text" name="text" class="cmdk-input" placeholder="${globalState.currentToolCommand.usage}">`
    }
                    <p id="cmdk-tool-error" style="color: red;"></p>
                    <button type="submit">Execute</button>
                    <button type="button" id="tool-back" class="back-button">Back</button>
                </form>
            </div>
        `;

  container.innerHTML = html;
  attachHeaderEvents();

  const form = shadow.getElementById("tool-form");
  const textInput = shadow.getElementById("tool-text");
  textInput.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const args = { text: formData.get("text") || "" };
    if (globalState.currentToolCommand.kwargs) {
      globalState.currentToolCommand.kwargs.forEach((kwarg) => {
        args[kwarg.name] = formData.get(kwarg.name) ||
          kwarg.default || "";
      });
    }
    processToolInput(args);
  });

  shadow.getElementById("tool-back").addEventListener(
    "click",
    () => setRenderMode("list"),
  );
}