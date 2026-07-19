import { For, onMount } from "solid-js";
import type { Command } from "../../../src/types/index";
import CmdkHeader from "./CmdkHeader";
import { defaultCommands } from "../commands";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

interface ShortcutItem {
  name: string;
  shortcut: string;
  path: string[];
}

function collectShortcuts(list: Command[], path: string[], acc: ShortcutItem[]): void {
  for (const cmd of list) {
    const currentPath = [...path, cmd.name];
    if (cmd.shortcut) {
      acc.push({
        name: cmd.name,
        shortcut: cmd.shortcut,
        path: currentPath,
      });
    }
    if (cmd.children) {
      collectShortcuts(cmd.children, currentPath, acc);
    }
  }
}

export default function ShortcutsView(props: Props) {
  const shortcuts: ShortcutItem[] = [];
  collectShortcuts(defaultCommands, [], shortcuts);
  let scrollRef: HTMLDivElement | undefined;

  onMount(() => {
    scrollRef?.focus();
  });

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      props.onBack();
    }
  }

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="shortcuts-container" ref={scrollRef} tabindex="0" on:keydown={handleKeyDown}>
        <div class="help-group-title">Keyboard Shortcuts</div>
        <div class="help-section">
          <For each={shortcuts}>
            {(item) => (
              <div class="shortcut-row">
                <div>
                  <div class="shortcut-name">{item.name}</div>
                  {item.path.length > 1 && (
                    <div style={{ "font-size": "11px", color: "var(--text-muted)", "margin-top": "2px" }}>
                      {item.path.slice(0, -1).join(" / ")}
                    </div>
                  )}
                </div>
                <div class="shortcut-keys">
                  <For each={item.shortcut.split("")}>
                    {(char) => <kbd class="cmdk-kbd">{char}</kbd>}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="cmdk-footer">
        <button class="btn btn-ghost" onClick={props.onBack}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </>
  );
}
