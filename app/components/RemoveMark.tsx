import React, { FC, useState } from "react";
import styled from 'styled-components/native'
import { View, Text } from "react-native";
import {Button} from 'react-native-elements';
import { Feature, Point } from '@turf/helpers';


const Container = styled(View)`
    position: absolute;
    justify-content: center;
    align-items: center;
    top:0;
    bottom:0;
    left:0;
    right:0;
    width: 100%;
    flex: 1;
`
const FormContainer = styled(View)`
    justify-content: center;
    align-items: center;
    backgroundColor: white;
    borderRadius: 30px;
    top:0;
    bottom:0;
    left:0;
    right:0;
    min-width: 50px;
    height: 200px;
`
const ButtonsContainer = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin: 20px;
`
const StyledText = styled(Text)`
    font-size: 20px;
    margin: 20px;
`
const StyledButton = styled(Button)`
    min-width: 50px;
`

interface Props {
    mark: Feature<Point>;
    remove: () => void;
    cancel: () => void;
}

const RemoveMark: FC<Props> = ({ mark, remove, cancel }) => {
    
    return <Container>
        <FormContainer>
            <StyledText>Remove: {mark.properties?.name}?</StyledText>
            <ButtonsContainer>
                <StyledButton onPress={() => remove()} title="Remove" buttonStyle={{width:150}} />
                <StyledButton onPress={() => cancel()} title="Cancel" type="clear" buttonStyle={{width:150}}/>
            </ButtonsContainer>
        </FormContainer>
    </Container>
}

export default RemoveMark