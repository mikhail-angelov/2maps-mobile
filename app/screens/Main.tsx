import React, { FC, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import Map from './Map';
import Overlay from './Overlay';
import AuthManager from "../components/AuthManager";
import { getLocalhostPortNativeModule } from "../actions/api";

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
  },
});

const Main: FC<{}> = () => {
  const [map, setMap] = useState<MapboxGL.MapView | undefined>()
  const [camera, setCamera] = useState<MapboxGL.Camera | undefined>()
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    getLocalhostPortNativeModule().then(() => {
      setShowMap(true)
    })
  }, [])
  return (<View style={styles.container}>
    <AuthManager />
    {showMap && (
      <>
        <Map setMap={setMap} setCamera={setCamera} />
        <Overlay map={map} camera={camera} />
      </>
    )}
  </View>)
}
export default Main
