import { ActionTypeEnum, AppThunk } from ".";
// import { post, getWithAuth, postWithAuth, setToken } from "./api";
import { Mark } from "../store/types";


export const loadMarksAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.MarksRequest });
      // const response = await post(`${AUTH_URL}/login`, credentials);

      // dispatch({
      //   type: ActionTypeEnum.MarksSuccess,
      //   payload: response.data,
      // });
    } catch (e) {
      console.log("marks error", e);
      dispatch({
        type: ActionTypeEnum.MarksFailure,
        payload: "marks failure",
      });
    }
  };
};

export const addMarkAction = (mark: Mark): AppThunk => {
  return async (dispatch) => {
      dispatch({ type: ActionTypeEnum.AddMark, payload: mark });
  };
};
export const removeMarkAction = (id: string): AppThunk => {
  return async (dispatch) => {
      dispatch({ type: ActionTypeEnum.RemoveMark, payload: id });
  };
};