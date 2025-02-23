(() => {
  // Create a container div and attach a Shadow Root.
  const containerDiv = document.createElement("div");
  containerDiv.id = "cmdk-extension-container";
  const shadow = containerDiv.attachShadow({
      mode: "open",
      delegatesFocus: true,
  });
  document.documentElement.appendChild(containerDiv);

  // Inject the CMDK HTML into the shadow DOM.
  const cmdkHTML = `
    <div id="cmdk-overlay" class="cmdk-overlay">
      <div class="cmdk-container fade-in" id="cmdk-container">
        <!-- CMDK content will be dynamically injected here by cmdk.js -->
      </div>
    </div>
  `;
  // Use innerHTML on the ShadowRoot (insertAdjacentHTML isn’t supported).
  shadow.innerHTML = cmdkHTML;

  // contentScript.js (after attaching the shadow root)
  const linkElem = document.createElement("link");
  linkElem.rel = "stylesheet";
  linkElem.href = chrome.runtime.getURL("content.css");
  shadow.appendChild(linkElem);

  // Expose the shadow root for use in cmdk.js.
  window.__CMDK_SHADOW_ROOT__ = shadow;
})();
