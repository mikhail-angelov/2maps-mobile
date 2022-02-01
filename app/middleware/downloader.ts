import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import { DeviceEventEmitter } from "react-native";
import { ActionTypeEnum } from "../actions";

export const downingMiddleware: Middleware = ({ dispatch }: MiddlewareAPI) => {
    DeviceEventEmitter.addListener('map-download', (event) => {
        console.log('map-download', event);
        dispatch({ type: ActionTypeEnum.LoadMapProgress, payload: event })
    });
    DeviceEventEmitter.addListener('map-transfer', (completePersent: number) => {
        console.log('map-transfer', completePersent);
        dispatch({ type: ActionTypeEnum.RelocateMapProgress, payload: completePersent })
    });
    return (next: Dispatch) => action => next(action)
}
