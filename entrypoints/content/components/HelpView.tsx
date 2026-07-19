import { For, onMount } from "solid-js";
import type { Command } from "../../../src/types/index";
import CmdkHeader from "./CmdkHeader";
import { defaultCommands } from "../commands";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

function HelpEntry(props: { command: Command; depth: number }) {
  const cmd = () => props.command;

  return (
    <div class="help-entry" style={{ "padding-left": `${props.depth * 16 + 8}px` }}>
      <div class="help-entry-left">
        <div class="help-entry-name">{cmd().name}</div>
        {cmd().help && <div class="help-entry-desc">{cmd().help}</div>}
        {cmd().usage && <div class="help-entry-usage">{cmd().usage}</div>}
      </div>
      {cmd().shortcut && (
        <div class="help-entry-shortcut">
          <div class="shortcut-keys">
            <For each={cmd().shortcut.split("")}>
              {(char) => <kbd class="cmdk-kbd">{char}</kbd>}
            </For>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpGroup(props: { command: Command; depth: number }) {
  const cmd = () => props.command;

  return (
    <div class="help-section">
      <HelpEntry command={cmd()} depth={props.depth} />
      {cmd().children && (
        <For each={cmd().children}>
          {(child) => <HelpGroup command={child} depth={props.depth + 1} />}
        </For>
      )}
    </div>
  );
}

export default function HelpView(props: Props) {
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
      <div class="help-container" ref={scrollRef} tabindex="0" on:keydown={handleKeyDown}>
        <div class="help-group-title">Available Commands</div>
        <For each={defaultCommands}>
          {(cmd) => <HelpGroup command={cmd} depth={0} />}
        </For>
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
