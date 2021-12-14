import React, { FC, useState} from "react";
import styled from 'styled-components/native'
import { View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import Map from './Map';
import Overlay from './Overlay';
import AuthManager from "../components/AuthManager";
import AdMob from "../components/AdMob";

const Container = styled(View)`
display: flex;
flex-direction: column;
flex: 1;
`
const MapContainer = styled(View)`
flex: 1;
position: relative;
`
const Main: FC<{}> = () =>{
 const [map, setMap] = useState<MapboxGL.Camera|undefined>() 
  return (<Container>
    <AuthManager />
    <MapContainer>
      <Map setMap={setMap}/>
      <Overlay map={map}/>
    </MapContainer>    
    <AdMob />
  </Container>)
}
export default Main