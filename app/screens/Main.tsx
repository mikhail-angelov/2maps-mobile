import React, { FC, useState} from "react";
import styled from 'styled-components/native'
import { View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import Map from './Map';
import Overlay from './Overlay';
import AuthManager from "../components/AuthManager";

const Container = styled(View)`
flex-direction: column;
position: relative;
flex: 1;
`

const Main: FC<{}> = () =>{
 const [map, setMap] = useState<MapboxGL.MapView|undefined>() 
 const [camera, setCamera] = useState<MapboxGL.Camera|undefined>() 
  return (<Container>
    <AuthManager />
    <Map setMap={setMap} setCamera={setCamera} />
    <Overlay map={map} camera={camera}/>
  </Container>)
}
export default Main