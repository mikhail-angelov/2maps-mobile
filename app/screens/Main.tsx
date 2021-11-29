import React, { FC, useState} from "react";
import styled from 'styled-components/native'
import {  View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import  Map  from './Map';
import Overlay from './Overlay';

const Container = styled(View)`
flex: 1;
position: relative;
`
const Main: FC<{}> = () =>{
 const [map, setMap] = useState<MapboxGL.Camera|undefined>() 
  return (<Container>
    <Map setMap={setMap}/>
    <Overlay map={map}/>
  </Container>)
}
export default Main