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
import trips from "./trips";
import settings from "./settings";

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
  blacklist: ['relocating', 'relocateProgress', 'loading', 'downloading', 'downloadProgress', 'error','showWikimapia']
}
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isRequestInProgress', 'error'],
}
const tripsPersistConfig = {
  key: 'trips',
  storage: AsyncStorage,
}
const drawingsPersistConfig = {
  key: 'drawings',
  storage: AsyncStorage,
  blacklist: ['activeDrawingChunk'],
}
const settingsPersistConfig = {
  key: 'settings',
  storage: AsyncStorage,
}
const rootReducer = combineReducers({
  marks: persistReducer(marksPersistConfig, marks),
  tracker: persistReducer(trackerPersistConfig, tracker),
  map: persistReducer(mapPersistConfig, map),
  auth: persistReducer(authPersistConfig, auth),
  network,
  ui,
  drawings: persistReducer(drawingsPersistConfig, drawings),
  trips: persistReducer(tripsPersistConfig, trips),
  settings: persistReducer(settingsPersistConfig, settings),
} as any);

export default rootReducer;
