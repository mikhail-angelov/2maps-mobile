import React, { FC } from "react";
import styled from 'styled-components/native'
import { View } from "react-native";
import { ListItem, Icon} from 'react-native-elements';


const Container = styled(View)`
    position: absolute;

    width: 100%;
    flex: 1;
`

export enum MENU {
    Cancel,
    ToggleTracking,
    SelectTrack,
    Tracks,
    Import,
    Export,
}



interface Props {
    isTracking: boolean;
    isRecording: boolean;
    handle: (item: MENU) => void;
}

const MenuList: FC<Props> = ({ isTracking, isRecording, handle }) => {

    const list = [
        {
            name: 'Cancel',
            item: MENU.Cancel,
            icon: 'map',
        },
        {
            name: isTracking ? 'Stop tracking' : 'Start tracking',
            icon: isTracking ? 'gps-not-fixed' : 'gps-fixed',
            item: MENU.ToggleTracking,
        },
        {
            name: 'Tracks',
            item: MENU.Tracks,
            icon: 'terrain'
        },
        {
            name: 'Select Track',
            item: MENU.SelectTrack,
            icon: 'share'
        },
        {
            name: 'Import POI',
            item: MENU.Import,
            icon: 'file-download',
        },
        {
            name: 'Export',
            item: MENU.Export,
            icon: 'import-export',
        },
    ]
    return <Container>
        {
            list.map((l, i) => (
                <ListItem key={i} bottomDivider onPress={() => handle(l.item)}>
                    <Icon name={l.icon} />
                    <ListItem.Content>
                        <ListItem.Title>{l.name}</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            ))
        }
    </Container>
}

export default MenuList