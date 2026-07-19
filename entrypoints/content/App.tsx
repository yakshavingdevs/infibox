import { createSignal, Switch, Match, onMount, onCleanup } from "solid-js";
import type { Command, SearchResult, Mode } from "../../src/types";
import { matchShortcut } from "./shortcuts";
import { defaultCommands } from "./commands";
import { registerBridge } from "./app-bridge";
import { destroyShadow, getShadowHost } from "./shadow-context";
import CmdkList from "./CmdkList";
import CmdkTool from "./CmdkTool";
import CmdkResult from "./CmdkResult";
import TodoView from "./TodoView";

let shortBuf = "";
let shortTimer: ReturnType<typeof setTimeout> | undefined;

export default function App() {
  const [mode, setMode] = createSignal<Mode>("list");
  const [commandStack, setCommandStack] = createSignal<Command[][]>([defaultCommands]);
  const [currentList, setCurrentList] = createSignal(defaultCommands);
  const [currentToolCommand, setCurrentToolCommand] = createSignal<Command | null>(null);
  const [currentResult, setCurrentResult] = createSignal("");
  const [prefill, setPrefill] = createSignal("");

  registerBridge(setMode, setCurrentResult, setCurrentToolCommand as (cmd: Command) => void, setPrefill);

  onMount(() => {
    getShadowHost().style.setProperty("--primary", "--primary-placeholder");

    document.addEventListener("keydown", handleKeydown, { capture: true });

    onCleanup(() => {
      document.removeEventListener("keydown", handleKeydown, { capture: true });
    });
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      destroyShadow();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      shortBuf += e.key.toLowerCase();
      clearTimeout(shortTimer);
      shortTimer = setTimeout(() => { shortBuf = ""; }, 1000);
      const { exact } = matchShortcut(shortBuf, defaultCommands);
      if (exact) {
        e.preventDefault();
        e.stopPropagation();
        shortBuf = "";
        if (exact.children) {
          setCommandStack([exact.children]);
          setCurrentList(exact.children);
          setMode("list");
        } else if (exact.requiresInput) {
          setCurrentToolCommand(exact);
          setMode("tool");
        } else if (exact.action) {
          exact.action();
        }
        return;
      }
    }
  }

  function executeCommand(result: SearchResult) {
    const cmd = result.cmd;
    if (cmd.children) {
      setCommandStack([...commandStack(), cmd.children]);
      setCurrentList(cmd.children);
      setMode("list");
    } else if (cmd.requiresInput) {
      setCurrentToolCommand(cmd);
      setPrefill("");
      setMode("tool");
    } else if (cmd.action) {
      cmd.action();
    }
  }

  function goBack() {
    const stack = commandStack();
    if (stack.length <= 1) return;
    const prev = stack[stack.length - 2];
    setCommandStack(stack.slice(0, -1));
    setCurrentList(prev);
    setMode("list");
  }

  function goHome() {
    setCommandStack([defaultCommands]);
    setCurrentList(defaultCommands);
    setMode("list");
  }

  return (
    <div class="cmdk-container fade-in">
      <Switch>
        <Match when={mode() === "list"}>
          <CmdkList
            commandStack={commandStack()}
            currentList={currentList()}
            onExecute={executeCommand}
            onBack={goBack}
            onHome={goHome}
          />
        </Match>
        <Match when={mode() === "tool" && currentToolCommand() !== null}>
          <CmdkTool
            command={currentToolCommand()!}
            prefill={prefill()}
            onSubmit={(args) => {
              const cmd = currentToolCommand();
              if (!cmd?.processInput) return;
              const output = cmd.processInput(args);
              setCurrentResult(output);
              setMode("result");
            }}
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={mode() === "result"}>
          <CmdkResult
            title={currentToolCommand()?.name || "Result"}
            result={currentResult()}
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={mode() === "todo"}>
          <TodoView
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
      </Switch>
    </div>
  );
}
