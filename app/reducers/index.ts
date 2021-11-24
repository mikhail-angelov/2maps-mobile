import { combineReducers } from "redux";
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer as network } from 'react-native-offline';
import marks from "./marks";
import tracker from "./tracker";
import map from "./map";
import wiki from "./wiki";
import auth from "./auth";

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
}
const mapPersistConfig = {
  key: 'map',
  storage: AsyncStorage,
}
const wikiPersistConfig = {
  key: 'wiki',
  storage: AsyncStorage,
}
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
}

const rootReducer = combineReducers({
  marks: persistReducer(marksPersistConfig, marks),
  tracker: persistReducer(trackerPersistConfig, tracker),
  map: persistReducer(mapPersistConfig, map),
  wiki: persistReducer(wikiPersistConfig, wiki),
  auth: persistReducer(authPersistConfig, auth),
  network
} as any);

export default rootReducer;
