let _shadow: ShadowRoot | null = null;
let _host: HTMLElement | null = null;
let _remove: (() => void) | null = null;

export function initShadow(
  s: ShadowRoot,
  h: HTMLElement,
  removeFn: () => void,
): void {
  _shadow = s;
  _host = h;
  _remove = removeFn;
}

export function destroyShadow(): void {
  _remove?.();
  _remove = null;
  _shadow = null;
  _host = null;
}

export function isShadowMounted(): boolean {
  return _remove !== null;
}

export function getShadowElement(id: string): HTMLElement | null {
  return _shadow?.getElementById(id) ?? null;
}

export function getShadowElementOrThrow(id: string): HTMLElement {
  const el = _shadow?.getElementById(id);
  if (!el) throw new Error(`Shadow element #${id} not found`);
  return el;
}

export function queryShadow(selector: string): Element | null {
  return _shadow?.querySelector(selector) ?? null;
}

export function getShadowActiveElement(): Element | null {
  return _shadow?.activeElement ?? null;
}

export function getShadowHost(): HTMLElement {
  if (!_host) throw new Error("Shadow host not initialized");
  return _host;
}
