import React, { useEffect } from 'react';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { StatusBar, Platform } from 'react-native';
import { ReduxNetworkProvider } from 'react-native-offline'
import SplashScreen from "react-native-splash-screen";
import createStore from './store'
import Tracker from './Tracker'
import ModalManager from './ModalManager'
import Main from './screens/Main'

const { store, persistor } = createStore()

const App = () => {
  useEffect(() => {
    // NativeModules.FullScreen.enable()
    StatusBar.setBarStyle("dark-content");
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    SplashScreen.hide();
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReduxNetworkProvider>
          <Tracker />
          <Main />
          <ModalManager />
        </ReduxNetworkProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
