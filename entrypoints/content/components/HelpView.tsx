import { For } from "solid-js";
import type { Command } from "../../../src/types/index";
import CmdkHeader from "./CmdkHeader";
import { defaultCommands } from "../commands";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

function HelpEntry(props: { command: Command; depth: number }) {
  const cmd = () => props.command;
  const indent = () => props.depth * 16;

  return (
    <div style={{ "margin-left": `${indent()}px`, "margin-bottom": "12px" }}>
      <div style={{ "font-weight": "600" }}>{cmd().name}</div>
      {cmd().shortcut && (
        <div style={{ "font-size": "13px", color: "#555" }}>
          Shortcut: <kbd>{cmd().shortcut}</kbd>
        </div>
      )}
      <div style={{ "font-size": "13px", color: "#555" }}>
        {cmd().help || "No description available."}
      </div>
      {cmd().usage && (
        <div style={{ "font-size": "12px", color: "#888", "font-style": "italic" }}>
          Usage: {cmd().usage}
        </div>
      )}
      {cmd().children && (
        <For each={cmd().children}>
          {(child) => <HelpEntry command={child} depth={props.depth + 1} />}
        </For>
      )}
    </div>
  );
}

export default function HelpView(props: Props) {
  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="result-container">
        <p><strong>Help</strong></p>
        <div class="result-box" style={{ "font-size": "14px", "line-height": "1.5" }}>
          <For each={defaultCommands}>
            {(cmd) => <HelpEntry command={cmd} depth={0} />}
          </For>
        </div>
        <button class="back-button" onClick={props.onBack}>Back</button>
      </div>
    </>
  );
}
