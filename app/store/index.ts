import { applyMiddleware, compose, createStore } from "redux";
import { createNetworkMiddleware } from 'react-native-offline'
import thunk from "redux-thunk";
import { persistStore } from 'redux-persist'
import rootReducer from "../reducers";
import {downingMiddleware} from "../middleware/downloader";

const middleware = [thunk, createNetworkMiddleware(), downingMiddleware];

export default () => {
    const store = createStore(rootReducer, {}, applyMiddleware(...middleware));
    const persistor = persistStore(store as any,)
    return { store, persistor }
}

