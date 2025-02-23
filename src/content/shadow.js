const containerDiv = document.createElement("div");
containerDiv.id = "cmdk-extension-container";

const shadow = containerDiv.attachShadow({
  mode: "open",
  delegatesFocus: true,
});
document.documentElement.appendChild(containerDiv);

const cmdkHTML = `
        <div id="cmdk-overlay" class="cmdk-overlay">
          <div class="cmdk-container fade-in" id="cmdk-container">
            <!-- CMDK content will be dynamically injected here by cmdk.js -->
          </div>
        </div>
    `;

shadow.innerHTML = cmdkHTML;

const linkElem = document.createElement("link");
linkElem.rel = "stylesheet";
linkElem.href = chrome.runtime.getURL("css/content.css");
shadow.appendChild(linkElem);

export { shadow };