import { ActionTypeEnum } from ".";
import { ModalParams } from '../store/types'

export const showModalAction = (modalParams: ModalParams) => {
  return { type: ActionTypeEnum.UIAddModal, payload: modalParams }
};

export const removeModalAction = () => {
  return { type: ActionTypeEnum.UIRemoveModal}
};
