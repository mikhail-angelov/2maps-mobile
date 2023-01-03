import React, {FC} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {POI} from '../store/types';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 50,
  },
});
interface Props {
  onData: (data: POI[]) => void;
}

const ImportFile: FC<Props> = ({onData}: Props) => {
  const onImport = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: DocumentPicker.types.allFiles,
        copyTo: 'cachesDirectory',
      });
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
        res.fileCopyUri,
      );
      const data = await RNFS.readFile(decodeURI(res.fileCopyUri), 'utf8');
      const pois = JSON.parse(data) as POI[];
      console.log('-1-', pois);
      onData(pois || []);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={onImport}
        title="I"
        buttonStyle={{width: 44, height: 44}}
      />
    </View>
  );
};

export default ImportFile;
