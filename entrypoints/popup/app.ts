function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<HTMLElementTagNameMap[K]> & { innerText?: string } = {},
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "innerText") {
      el.innerText = value as string;
    } else {
      (el as Record<string, unknown>)[key] = value;
    }
  }
  return el;
}

function buildPopup(): void {
  const root = document.getElementById("root")!;
  root.className = "container";

  const logo = createElement("div", { className: "logo", innerText: "i" });

  const title = createElement("h1", { innerText: "Infibox" });

  const subtitle = createElement("p", {
    className: "subtitle",
    innerText: "The ultimate developer productivity companion",
  });

  const shortcutHint = createElement("div", { className: "shortcut-hint" });
  const hintKbd = createElement("kbd", { innerText: "Ctrl+Shift+K" });
  shortcutHint.innerText = "Press ";
  shortcutHint.appendChild(hintKbd);
  shortcutHint.appendChild(document.createTextNode(" on any page to open the command palette"));

  const dashboardBtn = createElement("button", {
    className: "btn-dashboard",
    innerText: "Open Dashboard",
  });
  dashboardBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  const footer = createElement("div", {
    className: "footer",
    innerText: "Infibox v0.0.1",
  });

  root.append(logo, title, subtitle, shortcutHint, dashboardBtn, footer);
}

document.addEventListener("DOMContentLoaded", buildPopup);
