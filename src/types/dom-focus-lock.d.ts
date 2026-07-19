declare module "dom-focus-lock" {
  interface FocusLock {
    on(node: HTMLElement): void;
    off(node: HTMLElement): void;
  }
  const focusLock: FocusLock;
  export default focusLock;
}
