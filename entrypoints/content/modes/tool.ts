import { globalState } from "../state";
import { setRenderMode } from "../render";
import { shadow } from "../shadow";
import { getHeaderHTML, attachHeaderEvents } from "../header";

export function processToolInput(args: Record<string, string>): void {
  const cmd = globalState.currentToolCommand;
  if (!cmd || !cmd.processInput) return;
  try {
    const output = cmd.processInput(args);
    globalState.currentResult = output;
    setRenderMode("result");
  } catch (err) {
    const errorEl = shadow.getElementById("cmdk-tool-error");
    if (errorEl) errorEl.textContent = err instanceof Error ? err.message : String(err);
  }
}

export function renderToolMode(): void {
  if (!globalState.currentToolCommand) {
    console.error("renderToolMode called with null globalState.currentToolCommand");
    setRenderMode("list");
    return;
  }
  const container = shadow.getElementById("cmdk-container")!;
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

  const form = shadow.getElementById("tool-form") as HTMLFormElement | null;
  const textInput = shadow.getElementById("tool-text") as HTMLInputElement | HTMLTextAreaElement | null;
  if (!form || !textInput) return;
  textInput.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const args: Record<string, string> = { text: (formData.get("text") as string) || "" };
    const cmd = globalState.currentToolCommand;
    if (cmd?.kwargs) {
      cmd.kwargs.forEach((kwarg) => {
        args[kwarg.name] = (formData.get(kwarg.name) as string) ||
          String(kwarg.default ?? "") || "";
      });
    }
    processToolInput(args);
  });

  shadow.getElementById("tool-back")!.addEventListener(
    "click",
    () => setRenderMode("list"),
  );
}
