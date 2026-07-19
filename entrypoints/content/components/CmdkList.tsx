import { createSignal, For, onMount } from "solid-js";
import type { Command, SearchResult } from "../../src/types/index";
import { globalSearch } from "../utils/search";
import CmdkHeader from "./CmdkHeader";

interface Props {
  commandStack: Command[][];
  currentList: Command[];
  onExecute: (result: SearchResult) => void;
  onBack: () => void;
  onHome: () => void;
}

export default function CmdkList(props: Props) {
  const [query, setQuery] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  onMount(() => inputRef?.focus());

  const results = () => {
    const q = query().trim();
    if (!q) return props.currentList.map((cmd) => ({ cmd, breadcrumb: [] as Command[] }));
    return globalSearch(q, props.commandStack[0] ?? props.currentList, []);
  };

  const [activeIndex, setActiveIndex] = createSignal(0);
  const filtered = () => results();

  function onKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      return; // handled by document listener in App
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered().length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered().length) % filtered().length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const f = filtered();
      if (f.length > 0 && activeIndex() < f.length) {
        props.onExecute(f[activeIndex()]);
      }
      return;
    }
    if (e.key === "Backspace" && query() === "" && props.commandStack.length > 1) {
      e.preventDefault();
      props.onBack();
    }
  }

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <input
        ref={inputRef}
        type="text"
        class="cmdk-input"
        placeholder="Type a command (? for help)..."
        value={query()}
        onInput={(e) => { setQuery(e.currentTarget.value); setActiveIndex(0); }}
        on:keydown={onKeyDown}
      />
      <ul class="cmdk-list">
        <For each={filtered()}>
          {(result, i) => {
            const fullPath = result.breadcrumb.length > 0
              ? result.breadcrumb.map((b) => b.name).join(" > ") + " > " + result.cmd.name
              : result.cmd.name;
            return (
              <li
                classList={{ "cmdk-item": true, active: i() === activeIndex() }}
                title={`${result.cmd.help || "No help available."}\nUsage: ${result.cmd.usage || "Not specified."}`}
                onClick={() => props.onExecute(result)}
              >
                {fullPath}{result.cmd.shortcut ? ` (${result.cmd.shortcut})` : ""}
              </li>
            );
          }}
        </For>
      </ul>
    </>
  );
}
