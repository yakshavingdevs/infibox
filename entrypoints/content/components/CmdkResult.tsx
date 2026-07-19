import { createSignal, Show, onMount } from "solid-js";
import CmdkHeader from "./CmdkHeader";

interface Props {
  title: string;
  result: string;
  onBack: () => void;
  onHome: () => void;
}

export default function CmdkResult(props: Props) {
  const [copied, setCopied] = createSignal(false);
  let resultRef: HTMLDivElement | undefined;

  onMount(() => {
    resultRef?.focus();
  });

  function copy() {
    navigator.clipboard.writeText(props.result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      props.onBack();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "c" && !window.getSelection()?.toString()) {
      e.preventDefault();
      copy();
    }
  }

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="result-container" on:keydown={handleKeyDown}>
        <div class="result-header">
          <div class="result-title">{props.title}</div>
        </div>
        <div
          ref={resultRef}
          class="result-box"
          tabindex="0"
          role="textbox"
          aria-readonly="true"
        >{props.result}</div>
        <div class="result-actions">
          <button class="btn btn-primary" onClick={copy}>
            <Show
              when={!copied()}
              fallback={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </Show>
            {copied() ? "Copied!" : "Copy"}
          </button>
          <button class="btn btn-secondary" onClick={props.onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>
    </>
  );
}
