import { combineReducers } from "redux";
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer as network } from 'react-native-offline';
import marks from "./marks";
import tracker from "./tracker";

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

const rootReducer = combineReducers({
  marks: persistReducer(marksPersistConfig, marks),
  tracker: persistReducer(trackerPersistConfig, tracker),
  network
} as any);

export default rootReducer;
