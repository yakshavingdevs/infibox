import { createSignal, For, onMount } from "solid-js";
import type { TodoTask } from "../../src/types";
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
    chrome.storage.local.get(["cmdkTodoTasks"], (result) => {
      setTasks((result.cmdkTodoTasks as TodoTask[]) || []);
    });
    inputRef?.focus();
  });

  function save(t: TodoTask[]) {
    setTasks(t);
    chrome.storage.local.set({ cmdkTodoTasks: t });
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

  return (
    <>
      <CmdkHeader onHome={props.onHome} />
      <div class="todo-container">
        <h3>Advanced To-Do</h3>
        <input
          ref={inputRef}
          type="text"
          class="todo-input"
          placeholder="Add a new task or link..."
          value={input()}
          onInput={(e: InputEvent) => setInput((e.currentTarget as HTMLInputElement).value)}
          on:keydown={(e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === "Enter") addTask();
            else if (e.key === "Escape") props.onBack();
          }}
        />
        <ul class="todo-list">
          <For each={tasks()}>
            {(task: TodoTask, i) => (
              <li classList={{ "todo-item": true, completed: task.completed }}>
                <span>{task.text}</span>
                <button onClick={() => toggleTask(i())}>
                  {task.completed ? "Undo" : "Done"}
                </button>
                <button onClick={() => deleteTask(i())}>Delete</button>
              </li>
            )}
          </For>
        </ul>
        <button class="back-button" onClick={props.onBack}>Back</button>
      </div>
    </>
  );
}
