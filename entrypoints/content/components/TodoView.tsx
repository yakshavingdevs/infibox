import { createSignal, For, Show, onMount } from "solid-js";
import type { TodoTask } from "../../src/types/index";
import { getTodoTasks, saveTodoTasks } from "../../../src/stores/app";
import CmdkHeader from "./CmdkHeader";

interface Props {
  onHome: () => void;
  onBack: () => void;
}

export default function TodoView(props: Props) {
  const [tasks, setTasks] = createSignal<TodoTask[]>([]);
  const [input, setInput] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    getTodoTasks().then((result) => {
      setTasks(result || []);
    });
    inputRef?.focus();
  });

  function save(t: TodoTask[]) {
    setTasks(t);
    saveTodoTasks(t);
  }

  function addTask() {
    const text = input().trim();
    if (!text) return;
    save([...tasks(), { text, completed: false }]);
    setInput("");
  }

  function toggleTask(index: number) {
    const updated = tasks().map((t, i) => i === index ? { ...t, completed: !t.completed } : t);
    save(updated);
  }

  function deleteTask(index: number) {
    save(tasks().filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      props.onBack();
    }
  }

  const completedCount = () => tasks().filter(t => t.completed).length;

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="todo-container" on:keydown={handleKeyDown}>
        <div class="todo-header">
          <div class="todo-title">To-Do</div>
          <Show when={tasks().length > 0}>
            <div style={{ "font-size": "12px", color: "var(--text-muted)" }}>
              {completedCount()} of {tasks().length} completed
            </div>
          </Show>
        </div>
        <div class="todo-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            class="todo-input"
            placeholder="Add a new task..."
            value={input()}
            onInput={(e: InputEvent) => setInput((e.currentTarget as HTMLInputElement).value)}
            on:keydown={(e: KeyboardEvent) => {
              e.stopPropagation();
              if (e.key === "Enter") addTask();
            }}
          />
          <button class="btn btn-primary" onClick={addTask}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <Show
          when={tasks().length > 0}
          fallback={
            <div style={{ "text-align": "center", padding: "24px 0", color: "var(--text-muted)", "font-size": "13px" }}>
              No tasks yet. Add one above.
            </div>
          }
        >
          <ul class="todo-list">
            <For each={tasks()}>
              {(task: TodoTask, i) => (
                <li class="todo-item">
                  <button
                    class={`todo-checkbox ${task.completed ? "checked" : ""}`}
                    onClick={() => toggleTask(i())}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span class={`todo-text ${task.completed ? "completed" : ""}`}>
                    {task.text}
                  </span>
                  <button class="todo-delete" onClick={() => deleteTask(i())}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
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
