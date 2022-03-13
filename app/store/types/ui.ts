export enum ModalActionType {
  default='default',
  cancel='cancel',
}

export interface ModalAction {
  text: string;
  type?: string;
  handler?: ()=>void;
}
export interface ModalParams {
  title: string;
  text: string;
  actions: ModalAction[];
}

export interface UIState {
  modal?: ModalParams;
}
