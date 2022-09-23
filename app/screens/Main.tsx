import React, { FC, useEffect, useState } from "react";
import styled from 'styled-components/native'
import { View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import Map from './Map';
import Overlay from './Overlay';
import AuthManager from "../components/AuthManager";
import { getLocalhostPortNativeModule } from "../actions/api";

const Container = styled(View)`
flex-direction: column;
position: relative;
flex: 1;
`

const Main: FC<{}> = () => {
  const [map, setMap] = useState<MapboxGL.MapView | undefined>()
  const [camera, setCamera] = useState<MapboxGL.Camera | undefined>()
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    getLocalhostPortNativeModule().then(() => {
      setShowMap(true)
    })
  }, [])
  return (<Container>
    <AuthManager />
    {showMap && (
      <>
        <Map setMap={setMap} setCamera={setCamera} />
        <Overlay map={map} camera={camera} />
      </>
    )}
  </Container>)
}
export default Main