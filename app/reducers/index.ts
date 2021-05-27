import { combineReducers } from "redux";
import { persistReducer } from 'redux-persist'
// import storage from 'redux-persist/lib/storage'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer as network } from 'react-native-offline';
import marks from "./marks";

const marksPersistConfig = {
  key: 'marks',
  storage: AsyncStorage,
  whitelist: [
    'marks'
  ]
}

const rootReducer = combineReducers({
  marks: persistReducer(marksPersistConfig, marks),
  network
} as any);

export default rootReducer;
