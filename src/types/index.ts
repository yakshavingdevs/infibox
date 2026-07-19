export interface Kwarg {
  name: string;
  type: string;
  default?: string | number | boolean;
  help: string;
}

export interface Command {
  name: string;
  id?: string;
  contextMenuTitle?: string;
  shortcut?: string;
  help?: string;
  usage?: string;
  inline?: boolean;
  requiresInput?: boolean;
  type?: string;
  action?: () => void;
  processInput?: (args: Record<string, string>) => string;
  children?: Command[];
  kwargs?: Kwarg[];
}

export interface TodoTask {
  text: string;
  completed: boolean;
}

export type Mode = "list" | "tool" | "result" | "todo";

export interface SearchResult {
  cmd: Command;
  breadcrumb: Command[];
}

export interface MatchResult {
  exact: Command | null;
  partial: boolean;
}

export interface ContextMenuItem {
  id: string;
  title: string;
  contexts: string[];
  children?: ContextMenuItem[];
}
