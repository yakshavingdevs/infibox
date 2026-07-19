import { createSignal, For, onMount } from "solid-js";
import type { Command } from "../../src/types/index";
import CmdkHeader from "./CmdkHeader";

interface Props {
  command: Command;
  prefill?: string;
  onSubmit: (args: Record<string, string>) => void;
  onBack: () => void;
  onHome: () => void;
}

export default function CmdkTool(props: Props) {
  const { command } = props;
  let textInputRef: HTMLInputElement | undefined;
  let textAreaRef: HTMLTextAreaElement | undefined;
  const [error, setError] = createSignal("");

  onMount(() => {
    const el = textInputRef ?? textAreaRef;
    if (el) {
      if (props.prefill) el.value = props.prefill;
      el.focus();
    }
  });

  function handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const args: Record<string, string> = { text: (formData.get("text") as string) || "" };
    if (command.kwargs) {
      for (const kwarg of command.kwargs) {
        args[kwarg.name] = (formData.get(kwarg.name) as string) || String(kwarg.default ?? "");
      }
    }
    try {
      setError("");
      props.onSubmit(args);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      props.onBack();
    }
  }

  const isTextarea = command.type === "textarea";

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="tool-container">
        <div class="tool-header">
          <div class="tool-title">{command.name}</div>
          {command.help && <div class="tool-description">{command.help}</div>}
        </div>
        <form class="tool-form" onSubmit={handleSubmit} on:keydown={handleKeyDown}>
          <For each={command.kwargs}>
            {(kwarg) => (
              <div class="field-group">
                <label class="field-label" for={`kwarg-${kwarg.name}`}>
                  {kwarg.name}
                </label>
                {kwarg.type === "textarea" ? (
                  <textarea
                    id={`kwarg-${kwarg.name}`}
                    name={kwarg.name}
                    class="field-textarea"
                    placeholder={kwarg.help}
                  >{String(kwarg.default ?? "")}</textarea>
                ) : kwarg.type === "boolean" ? (
                  <label style={{ display: "flex", "align-items": "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      id={`kwarg-${kwarg.name}`}
                      name={kwarg.name}
                      checked={kwarg.default === true}
                      style={{ "accent-color": "var(--primary)" }}
                    />
                    <span style={{ "font-size": "13px", color: "var(--text-secondary)" }}>{kwarg.help}</span>
                  </label>
                ) : (
                  <input
                    type={kwarg.type}
                    id={`kwarg-${kwarg.name}`}
                    name={kwarg.name}
                    value={String(kwarg.default ?? "")}
                    class="field-input"
                    placeholder={kwarg.help}
                  />
                )}
              </div>
            )}
          </For>
          <div class="field-group">
            <label class="field-label" for="tool-text">Input</label>
            {isTextarea ? (
              <textarea
                ref={textAreaRef}
                id="tool-text"
                name="text"
                class="field-textarea"
                placeholder={command.usage || "Enter your text..."}
                on:keydown={handleKeyDown}
              />
            ) : (
              <input
                ref={textInputRef}
                type={command.type || "text"}
                id="tool-text"
                name="text"
                class="field-input"
                placeholder={command.usage || "Enter your text..."}
                on:keydown={handleKeyDown}
              />
            )}
          </div>
          {error() && <div class="field-error">{error()}</div>}
          <div class="tool-actions">
            <button type="submit" class="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 10 4 15 9 20" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              </svg>
              Execute
            </button>
            <button type="button" class="btn btn-secondary" onClick={props.onBack}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
