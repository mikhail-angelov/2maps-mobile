import React, { useEffect } from 'react';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { NativeModules, StatusBar, Platform } from 'react-native';
import { ReduxNetworkProvider } from 'react-native-offline'
import { useKeepAwake } from 'expo-keep-awake';
import createStore from './store'
import Tracker from './Tracker'
import Map from './screens/Map'

const { store, persistor } = createStore()

const App = () => {
  useEffect(() => {
    // NativeModules.FullScreen.enable()
    StatusBar.setBarStyle("dark-content");
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }, [])
  useKeepAwake()

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReduxNetworkProvider>
          <Tracker/>
          <Map />
        </ReduxNetworkProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
