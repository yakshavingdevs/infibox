import type { Command, SearchResult } from "../../src/types/index";

export function globalSearch(
  query: string,
  list: Command[],
  breadcrumb: Command[],
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const cmd of list) {
    if (cmd?.name?.toLowerCase().includes(query.toLowerCase())) {
      results.push({ cmd, breadcrumb: [...breadcrumb] });
    }
    if (cmd?.children) {
      results.push(...globalSearch(query, cmd.children, [...breadcrumb, cmd]));
    }
  }
  return results;
}
