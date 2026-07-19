import { Switch, Match, onMount, onCleanup } from "solid-js";
import type { SearchResult } from "../../src/types/index";
import { matchShortcut } from "./utils/shortcuts";
import { defaultCommands } from "./commands";
import {
  getState,
  setMode,
  setCurrentResult,
  setCurrentToolCommand,
  setPrefill,
  setCommandStack,
  setCurrentList,
} from "../../src/stores/app";
import { destroyShadow, getShadowHost } from "./utils/shadow-context";
import focusLock from "dom-focus-lock";
import CmdkList from "./components/CmdkList";
import CmdkTool from "./components/CmdkTool";
import CmdkResult from "./components/CmdkResult";
import HelpView from "./components/HelpView";
import ShortcutsView from "./components/ShortcutsView";
import TodoView from "./components/TodoView";

let shortBuf = "";
let shortTimer: ReturnType<typeof setTimeout> | undefined;

export default function App() {
  const state = getState();

  onMount(() => {
    getShadowHost().style.setProperty("--primary", "--primary-placeholder");

    focusLock.on(getShadowHost());

    document.addEventListener("keydown", handleKeydown, { capture: true });

    onCleanup(() => {
      focusLock.off(getShadowHost());
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
      setCommandStack([...state.commandStack, cmd.children]);
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
    const stack = state.commandStack;
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
        <Match when={state.mode === "list"}>
          <CmdkList
            commandStack={state.commandStack}
            currentList={state.currentList}
            onExecute={executeCommand}
            onBack={goBack}
            onHome={goHome}
          />
        </Match>
        <Match when={state.mode === "tool" && state.currentToolCommand !== null}>
          <CmdkTool
            command={state.currentToolCommand!}
            prefill={state.prefill}
            onSubmit={(args) => {
              const cmd = state.currentToolCommand;
              if (!cmd?.processInput) return;
              const output = cmd.processInput(args);
              setCurrentResult(output);
              setMode("result");
            }}
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={state.mode === "result" && state.currentToolCommand?.name === "Help"}>
          <HelpView
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={state.mode === "result" && state.currentToolCommand?.name === "Registered Shortcuts"}>
          <ShortcutsView
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={state.mode === "result"}>
          <CmdkResult
            title={state.currentToolCommand?.name || "Result"}
            result={state.currentResult}
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
        <Match when={state.mode === "todo"}>
          <TodoView
            onBack={() => setMode("list")}
            onHome={goHome}
          />
        </Match>
      </Switch>
    </div>
  );
}
