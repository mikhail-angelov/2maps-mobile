import React, { FC, useState } from "react";
import styled from 'styled-components/native'
import { View, Text, TextInput } from "react-native";
import {Button} from 'react-native-elements';
import { Mark } from '../store/types'


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
    backgroundColor: white;
    borderRadius: 30px;
    top:0;
    bottom:0;
    left:0;
    right:0;
    width: 500px;
    height: 300px;
`
const ButtonsContainer = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin: 20px;
`
const StyledTextInput = styled(TextInput)`
    border: 1px solid grey;
    margin: 20px;
`
const StyledButton = styled(Button)`
    width: 300px;
`

interface Props {
    mark: Mark;
    save: (mark: Mark) => void;
    remove?: () => void;
    cancel: () => void;
}

const EditMark: FC<Props> = ({ mark, save, cancel, remove }) => {
    const [name, setName] = useState(mark.name)

    return <Container>
        <FormContainer>
            <StyledTextInput
                onChangeText={(value) => setName(value)}
                placeholder="name"
                value={name}
            />
            <ButtonsContainer>
                <StyledButton onPress={() => save({ ...mark, name })} title="Save" buttonStyle={{width:100}} />
                {remove && <StyledButton onPress={() => remove()} title="Remove" type="outline" buttonStyle={{width:100}}/>}
                <StyledButton onPress={() => cancel()} title="Cancel" type="clear" buttonStyle={{width:100}}/>
            </ButtonsContainer>
        </FormContainer>
    </Container>
}

export default EditMark