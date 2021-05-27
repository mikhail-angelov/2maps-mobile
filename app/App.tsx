import React from 'react';
import Config from 'react-native-config'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { SafeAreaView} from 'react-native';
import { ReduxNetworkProvider } from 'react-native-offline'

import createStore from './store'
import Map from './screens/Map'

const { store, persistor } = createStore()
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <ReduxNetworkProvider>
        {/* <SafeAreaView> */}
          <Map />
        {/* </SafeAreaView> */}
        </ReduxNetworkProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
