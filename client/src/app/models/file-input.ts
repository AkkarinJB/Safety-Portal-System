export interface FileInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface HTMLInputElement extends HTMLElement {
  files: FileList | null;
  value: string;
}

