import React, {FC, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Map from './Map';
import Overlay from './Overlay';
import AuthManager from '../components/AuthManager';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
  },
});

const Main = () => {
  const [map, setMap] = useState<MapboxGL.Camera | undefined>();
  return (
    <View style={styles.container}>
      <AuthManager />
      <Map setMap={setMap} />
      <Overlay map={map} />
    </View>
  );
};
export default Main;
