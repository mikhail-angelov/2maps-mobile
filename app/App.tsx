import React, { useEffect } from 'react';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ReduxNetworkProvider } from 'react-native-offline'
import SplashScreen from "react-native-splash-screen";
import createStore from './store'
import Tracker from './Tracker'
import ModalManager from './ModalManager'
import Main from './screens/Main'
import Mapbox from '@rnmapbox/maps';
import { Platform, StyleSheet, Text, View, LogBox, SafeAreaView } from 'react-native';
import { blue } from './constants/color';

const IS_ANDROID = Platform.OS === 'android';

LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);

const styles = StyleSheet.create({
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

Mapbox.setAccessToken('pk.eyJ1IjoibWlraGFpbGFuZ2Vsb3YiLCJhIjoiY2tpa2FnbnM5MDg5ejJ3bDQybWN3eWRsdSJ9.vK_kqebrJaO7MdIg4ilaFQ');

const { store, persistor } = createStore()

function AppContainer(): JSX.Element {
  useEffect(() => {
    // NativeModules.FullScreen.enable()
    // StatusBar.setBarStyle("dark-content");
    // Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent');
    // StatusBar.setTranslucent(true);
    // SplashScreen.hide();
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* <ReduxNetworkProvider> */}
       {/* <View style={{height:50, width:100}}>
         <Text>yo00000000000000000</Text>
       </View> */}
          <Tracker />
          <Main />
          <ModalManager />
        {/* </ReduxNetworkProvider> */}
      </PersistGate>
    </Provider>
  );
};

interface AppState {
  isFetchingAndroidPermission: boolean;
  isAndroidPermissionGranted: boolean;
  activeExample: number;
}

class App extends React.Component<any,AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      isFetchingAndroidPermission: IS_ANDROID,
      isAndroidPermissionGranted: false,
      activeExample: -1,
    };
  }

  async componentDidMount() {
    if (IS_ANDROID) {
      const isGranted = await Mapbox.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isGranted,
        isFetchingAndroidPermission: false,
      });
    }
  }

  render() {
    if (IS_ANDROID && !this.state.isAndroidPermissionGranted) {
      if (this.state.isFetchingAndroidPermission) {
        return null;
      }
      return (
        <SafeAreaView
          style={{flex: 1, backgroundColor: blue}}
        >
          <View style={{flex: 1}}>
            <Text style={styles.noPermissionsText}>
              You need to accept location permissions in order to use this
              example applications
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    return <AppContainer />;
  }
}

export default App;
