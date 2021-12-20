import React, { useEffect } from 'react';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { StatusBar, Platform } from 'react-native';
import { ReduxNetworkProvider } from 'react-native-offline'
import SplashScreen from  "react-native-splash-screen";
import { useKeepAwake } from 'expo-keep-awake';
import createStore from './store'
import Tracker from './Tracker'
import Main from './screens/Main'
import InAppPurchase from './components/InAppPurchase';

const { store, persistor } = createStore()

const App = () => {
  useEffect(() => {
    // NativeModules.FullScreen.enable()
    StatusBar.setBarStyle("dark-content");
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    SplashScreen.hide();
  }, [])
  useKeepAwake()

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReduxNetworkProvider>
          <InAppPurchase />
          <Tracker/>
          <Main />
        </ReduxNetworkProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
