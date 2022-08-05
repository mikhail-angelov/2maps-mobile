import { combineReducers } from "redux";
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer as network } from 'react-native-offline';
import marks from "./marks";
import tracker from "./tracker";
import map from "./map";
import auth from "./auth";
import ui from "./ui";
import drawings from "./drawings";

const marksPersistConfig = {
  key: 'marks',
  storage: AsyncStorage,
  whitelist: [
    'marks'
  ]
}
const trackerPersistConfig = {
  key: 'tracker',
  storage: AsyncStorage,
  blacklist: ['tracking', 'error'],
}
const mapPersistConfig = {
  key: 'map',
  storage: AsyncStorage,
  blacklist: ['relocating', 'loading', 'relocateProgress', 'error']
}
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isRequestInProgress', 'error'],
}
const drawingsPersistConfig = {
  key: 'drawings',
  storage: AsyncStorage,
  blacklist: ['activeDrawingChunk'],
}
const rootReducer = combineReducers({
  marks: persistReducer(marksPersistConfig, marks),
  tracker: persistReducer(trackerPersistConfig, tracker),
  map: persistReducer(mapPersistConfig, map),
  auth: persistReducer(authPersistConfig, auth),
  network,
  ui,
  drawings: persistReducer(drawingsPersistConfig, drawings),
} as any);

export default rootReducer;
