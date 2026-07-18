import type { Command, Mode } from "../../src/types";

let _onModeChange: ((mode: Mode) => void) | null = null;
let _onShowResult: ((result: string) => void) | null = null;
let _onSetToolCommand: ((cmd: Command) => void) | null = null;
let _onSetPrefill: ((text: string) => void) | null = null;

let _pendingMode: Mode | null = null;
let _pendingTool: Command | null = null;
let _pendingPrefill: string | null = null;

export function registerBridge(
  mode: (m: Mode) => void,
  result: (r: string) => void,
  tool: (c: Command) => void,
  prefill: (t: string) => void,
): void {
  _onModeChange = mode;
  _onShowResult = result;
  _onSetToolCommand = tool;
  _onSetPrefill = prefill;
  if (_pendingMode !== null) mode(_pendingMode);
  if (_pendingTool !== null) tool(_pendingTool);
  if (_pendingPrefill !== null) prefill(_pendingPrefill);
  _pendingMode = null;
  _pendingTool = null;
  _pendingPrefill = null;
}

export function setAppMode(mode: Mode): void {
  if (_onModeChange) { _onModeChange(mode); return; }
  _pendingMode = mode;
}

export function setAppCurrentResult(result: string): void {
  if (_onShowResult) { _onShowResult(result); return; }
}

export function setAppToolCommand(cmd: Command): void {
  if (_onSetToolCommand) { _onSetToolCommand(cmd); return; }
  _pendingTool = cmd;
}

export function setAppPrefill(text: string): void {
  if (_onSetPrefill) { _onSetPrefill(text); return; }
  _pendingPrefill = text;
}
