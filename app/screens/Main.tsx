import React, { FC} from "react";
import styled from 'styled-components/native'
import {  View } from "react-native";
import  Map  from './Map';
import Overlay from './Overlay';

const Container = styled(View)`
flex: 1;
position: relative;
`
const Main: FC<{}> = () => (<Container>
    <Map />
    <Overlay />
  </Container>)

export default Main