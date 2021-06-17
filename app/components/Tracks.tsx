import React, { FC } from "react";
import styled from 'styled-components/native'
import { View } from "react-native";
import { ListItem, Icon, Button } from 'react-native-elements';
import dayjs from 'dayjs'
import { orderBy } from 'lodash'
import distance from '@turf/distance';
import { Track } from '../store/types'

const Container = styled(View)`
    position: absolute;
    width: 100%;
    flex: 1;
`

export enum MENU {
    Cancel,
    ToggleTrack,
    ToggleTrackRecord,
    Import,
    Export,
}

interface Props {
    tracks: Track[];
    select: (id: string) => void;
    close: () => void;
}

const Tracks: FC<Props> = ({ tracks, select, close }) => {
    const list = orderBy(tracks, 'start', 'desc').map(({ id, name, start, end, track }) => {
        const l = distance(track[0], track[track.length - 1]).toFixed(3)
        const subtitle = `T: ${dayjs(end - start).format('HH:mm')}, L: ${l} km.`
        return {
            id,
            name: `${dayjs(start).format('YY.MM.DD HH:mm')} ${name}`,
            subtitle,
            icon: 'map',
        }
    })
    return <Container>
        <Button onPress={close}>Close</Button>
        {
            list.map((l, i) => (
                <ListItem key={i} bottomDivider onPress={() => select(l.id)}>
                    <Icon name={l.icon} />
                    <ListItem.Content>
                        <ListItem.Title>{l.name}</ListItem.Title>
                        <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
                    </ListItem.Content>
                </ListItem>
            ))
        }
    </Container>
}

export default Tracks