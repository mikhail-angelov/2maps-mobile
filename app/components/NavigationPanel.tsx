import React from "react";
import styled from 'styled-components/native'
import { View, Text, Image } from "react-native";
import { Button } from 'react-native-elements';
import { Position } from '@turf/helpers';
import distance from '@turf/distance';
import bearing from '@turf/bearing';
import { ThreeAxisMeasurement } from 'expo-sensors';
import { LocationObject } from 'expo-location';
import { compassAngle } from '../actions/tracker-actions'

const redArrowIcon = require('../assets/arrow.png')
const compassIcon = require('../assets/compass.png')

const Container = styled(View)`
    position: absolute;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    bottom:0;
    left:0;
    right:0;
    width: 100%;
    height: 200px;
`
const TextContainer = styled(View)`
    justify-content: flex-end;
    align-items: center;
    margin-right: 10px;
`

const StyledText = styled(Text)`
    font-size: 20px;
    margin: 10px;
    color: yellow;
`
const StyledButton = styled(Button)`
    color: yellow;
`
const Compass = styled(View)`
    position:relative;
    width: 200px;
    height: 200px;
    border: 1px solid grey;
    border-radius: 100px;
    background-color: grey;
    opacity: 0.7;
`
const ArrowC = styled(Image)`
    position:absolute;
    top: 0;
    left: 0;
    width:200px;
    height: 200px;
    border-radius: 100px;
    background-color: transparent;
    transform: ${(props: { angle: number }) => `rotate(${props.angle}deg)`};
    
`
const Arrow = styled(Image)`
    position:absolute;
    top: 0;
    left: 25px;
    height: 200px;
    width:150px;
    transform: ${(props: { angle: number }) => `rotate(${props.angle}deg)`};
`

interface Props {
    target: Position;
    location: LocationObject;
    compass: ThreeAxisMeasurement;
    close: () => void;
}

const NavigationPanel: React.FC<Props> = ({ location, target, compass, close }) => {
    const heading = compassAngle(compass)
    const center = [location.coords.longitude, location.coords.latitude]
    const d = target ? `${distance(target, center, { units: 'kilometers' }).toFixed(2)} km` : ''
    const s = `${(location.coords.speed || 0).toFixed(2)} km/ч`
    const a = `${(location.coords.altitude || 0).toFixed(2)} m`
    const azSelf = target ? bearing(center, target) : 0
    //console.log('comp', position[0], self[0], self[1], azSelf, d)

    return <Container>
        <Compass>
            <ArrowC source={compassIcon} angle={heading} />
            <Arrow source={redArrowIcon} angle={azSelf + heading} />
        </Compass>
        <TextContainer>
            <StyledText>L: {d}</StyledText>
            <StyledText>S: {s}</StyledText>
            <StyledText>A: {a}</StyledText>
            <StyledButton onPress={close} title="x" type="clear" buttonStyle={{ width: 150, borderColor: 'yellow' }} />
        </TextContainer>
    </Container>
}

export default NavigationPanel