import { createSignal, For, onMount } from "solid-js";
import type { Command } from "../../src/types";
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

  const textType = command.type === "textarea" ? "textarea" : `input type="${command.type}"`;

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="tool-container">
        <p><strong>{command.name}</strong>: {command.help}</p>
        <form onSubmit={handleSubmit}>
          <For each={command.kwargs}>
            {(kwarg) => (
              <>
                <label for={`kwarg-${kwarg.name}`}>{kwarg.name} ({kwarg.help}):</label>
                {kwarg.type === "textarea" ? (
                  <textarea id={`kwarg-${kwarg.name}`} name={kwarg.name} class="cmdk-input">{String(kwarg.default ?? "")}</textarea>
                ) : (
                  <input type={kwarg.type} id={`kwarg-${kwarg.name}`} name={kwarg.name} value={String(kwarg.default ?? "")} class="cmdk-input" />
                )}
              </>
            )}
          </For>
          <label for="tool-text">Text:</label>
          {textType === "textarea" ? (
            <textarea ref={textAreaRef} id="tool-text" name="text" class="cmdk-input" placeholder={command.usage}></textarea>
          ) : (
            <input ref={textInputRef} type={command.type} id="tool-text" name="text" class="cmdk-input" placeholder={command.usage} />
          )}
          <p style="color: red">{error()}</p>
          <button type="submit">Execute</button>
          <button type="button" class="back-button" onClick={props.onBack}>Back</button>
        </form>
      </div>
    </>
  );
}
