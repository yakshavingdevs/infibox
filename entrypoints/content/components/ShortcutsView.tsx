import { For } from "solid-js";
import type { Command } from "../../../src/types/index";
import CmdkHeader from "./CmdkHeader";
import { defaultCommands } from "../commands";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

function collectShortcuts(list: Command[], prefix: string, acc: { name: string; shortcut: string }[]): void {
  for (const cmd of list) {
    if (cmd.shortcut) {
      acc.push({ name: prefix ? `${prefix} > ${cmd.name}` : cmd.name, shortcut: cmd.shortcut });
    }
    if (cmd.children) {
      collectShortcuts(cmd.children, prefix ? `${prefix} > ${cmd.name}` : cmd.name, acc);
    }
  }
}

export default function ShortcutsView(props: Props) {
  const shortcuts: { name: string; shortcut: string }[] = [];
  collectShortcuts(defaultCommands, "", shortcuts);

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="result-container">
        <p><strong>Registered Shortcuts</strong></p>
        <div class="result-box" style={{ "font-size": "14px", "line-height": "1.5" }}>
          <For each={shortcuts}>
            {(item) => (
              <div style={{ display: "flex", "justify-content": "space-between", padding: "4px 0" }}>
                <span>{item.name}</span>
                <kbd>{item.shortcut}</kbd>
              </div>
            )}
          </For>
        </div>
        <button class="back-button" onClick={props.onBack}>Back</button>
      </div>
    </>
  );
}
