import { createSignal, For, Show, onMount, createMemo } from "solid-js";
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

function getCommandIcon(cmd: Command): string {
  const name = cmd.name.toLowerCase();
  if (name.includes("base64") || name.includes("b64")) return "B6";
  if (name.includes("hash")) return "#";
  if (name.includes("json")) return "{}";
  if (name.includes("url") || name.includes("encode")) return "%";
  if (name.includes("time") || name.includes("date")) return "T";
  if (name.includes("number") || name.includes("math")) return "#";
  if (name.includes("string") || name.includes("text") || name.includes("str")) return "Aa";
  if (name.includes("todo")) return "[]";
  if (name.includes("help")) return "?";
  if (name.includes("shortcut")) return "/";
  if (name.includes("reverse")) return "BA";
  if (name.includes("upper")) return "AA";
  if (name.includes("lower")) return "aa";
  if (name.includes("count")) return "#";
  if (name.includes("trim") || name.includes("space")) return "_";
  if (name.includes("replace")) return "R";
  if (name.includes("sort")) return "S";
  if (name.includes("split")) return "|";
  if (name.includes("join")) return "+";
  if (name.includes("repeat")) return "x";
  if (name.includes("pad")) return "-";
  if (name.includes("extract")) return ">";
  if (name.includes("parse")) return "P";
  if (name.includes("stringify")) return "S";
  if (name.children) return ">";
  return ">";
}

export default function CmdkList(props: Props) {
  const [query, setQuery] = createSignal("");
  const [activeIndex, setActiveIndex] = createSignal(0);
  let inputRef: HTMLInputElement | undefined;
  let listRef: HTMLUListElement | undefined;

  onMount(() => inputRef?.focus());

  const results = createMemo(() => {
    const q = query().trim();
    if (!q) return props.currentList.map((cmd) => ({ cmd, breadcrumb: [] as Command[] }));
    return globalSearch(q, props.commandStack[0] ?? props.currentList, []);
  });

  // Reset active index when list changes
  let lastListId = "";
  createMemo(() => {
    const listId = props.currentList.map(c => c.name).join(",");
    if (listId !== lastListId) {
      lastListId = listId;
      setActiveIndex(0);
      setQuery("");
    }
  });

  function scrollToActive() {
    if (!listRef) return;
    const activeItem = listRef.querySelector(".cmdk-item.active");
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      if (query()) {
        setQuery("");
        setActiveIndex(0);
      } else if (props.commandStack.length > 1) {
        props.onBack();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results().length);
      requestAnimationFrame(scrollToActive);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results().length) % results().length);
      requestAnimationFrame(scrollToActive);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const f = results();
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

  function onInput(e: InputEvent) {
    setQuery(e.currentTarget.value);
    setActiveIndex(0);
  }

  const currentBreadcrumb = () => {
    const stack = props.commandStack;
    if (stack.length <= 1) return [];
    return stack.slice(1).map((list) => {
      const parent = stack[0].find((cmd) => cmd.children === list);
      return parent || { name: "..." };
    }) as Command[];
  };

  return (
    <>
      <CmdkHeader onHome={props.onHome} onBack={props.commandStack.length > 1 ? props.onBack : undefined} breadcrumb={currentBreadcrumb()} />
      <div class="cmdk-search-wrapper">
        <svg class="cmdk-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          class="cmdk-input"
          placeholder="Search commands..."
          value={query()}
          onInput={onInput}
          on:keydown={onKeyDown}
        />
      </div>
      <ul class="cmdk-list" ref={listRef}>
        <Show
          when={results().length > 0}
          fallback={
            <li class="no-results">
              <div class="no-results-icon">?</div>
              <div class="no-results-text">No commands found</div>
              <div class="no-results-hint">Try a different search term</div>
            </li>
          }
        >
          <For each={results()}>
            {(result, i) => (
              <li
                classList={{ "cmdk-item": true, active: i() === activeIndex() }}
                onClick={() => props.onExecute(result)}
                onMouseEnter={() => setActiveIndex(i())}
              >
                <div class="cmdk-item-icon">{getCommandIcon(result.cmd)}</div>
                <div class="cmdk-item-content">
                  <div class="cmdk-item-name">{result.cmd.name}</div>
                  {result.cmd.help && (
                    <div class="cmdk-item-breadcrumb">{result.cmd.help}</div>
                  )}
                </div>
                {result.cmd.shortcut && (
                  <div class="cmdk-item-shortcut">
                    <For each={result.cmd.shortcut.split("")}>
                      {(char) => <kbd class="cmdk-kbd">{char}</kbd>}
                    </For>
                  </div>
                )}
              </li>
            )}
          </For>
        </Show>
      </ul>
      <div class="cmdk-footer">
        <div class="cmdk-footer-left">
          <Show when={props.commandStack.length > 1}>
            <button class="btn-ghost" onClick={props.onBack}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </Show>
          <button class="btn-ghost" onClick={props.onHome}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </button>
        </div>
        <div class="cmdk-footer-right">
          <span>{results().length} commands</span>
        </div>
      </div>
    </>
  );
}
