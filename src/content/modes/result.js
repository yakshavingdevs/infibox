import { globalState } from "../state";
import { getHeaderHTML, attachHeaderEvents } from "../header";
import { setRenderMode } from "../render";
import { shadow } from "../shadow";

export function renderResultMode() {
  const container = shadow.getElementById("cmdk-container");
  container.innerHTML = getHeaderHTML() + `
            <div class="result-container">
                <p>Result for <strong>${globalState.currentToolCommand?.name || "Result"
    }</strong>:</p>
                <div id="cmdk-result" class="result-box">${globalState.currentResult}</div>
                <button id="cmdk-copy">Copy to Clipboard</button>
                <button id="result-back">Back</button>
            </div>
        `;
  attachHeaderEvents();
  shadow.getElementById("cmdk-copy").addEventListener("click", () => {
    navigator.clipboard.writeText(globalState.currentResult)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => alert("Failed to copy: " + err));
  });
  shadow.getElementById("result-back").addEventListener(
    "click",
    () => setRenderMode("list"),
  );
}