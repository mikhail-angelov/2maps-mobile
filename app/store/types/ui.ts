export enum ModalActionType {
  default='default',
  cancel='cancel',
  input='input',
}

export interface ModalAction {
  text?: string;
  type?: string;
  handler?: (text?: string)=>void;
}
export interface ModalParams {
  title: string;
  text: string;
  actions: ModalAction[];
}

export interface UIState {
  awake: boolean;
  modal?: ModalParams;
}
