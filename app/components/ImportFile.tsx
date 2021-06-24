import React, { FC, useState } from "react";
import styled from 'styled-components/native'
import { Platform, View, Text, TextInput } from "react-native";
import { Button } from 'react-native-elements';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs'
import { POI } from '../store/types'

const Container = styled(View)`
    position: absolute;
    top:100px;
    right:50px;
`
interface Props {
  onData: (data: POI[]) => void;
}

const ImportFile: FC<Props> = ({ onData }: Props) => {

  const onImport = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
        res.fileCopyUri,
      );
      const data = await RNFS.readFile(decodeURI(res.fileCopyUri), 'utf8')
      const pois = JSON.parse(data) as POI[]
      console.log('-1-', pois)
      onData(pois || [])
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }

  }

  return <Container>
    <Button onPress={onImport} title="I" buttonStyle={{ width: 44, height: 44 }} />
  </Container>
}

export default ImportFile