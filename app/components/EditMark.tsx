import React, {FC, useState, useCallback, useRef} from 'react';
import {
  View,
  Linking,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {Button, Divider, AirbnbRating} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Mark, ModalActionType, ModalParams} from '../store/types';
import MapModal from './Modal';
import {purple} from '../constants/color';
import {markToDistance} from '../utils/normalize';
import {Position} from 'geojson';
import {useTranslation} from 'react-i18next';
import MapboxGL from '@rnmapbox/maps';
import SnapshotMark from './SnapshotMark';
import Share from 'react-native-share';
import {
  navigateYandex,
  navigateGoogle,
  navigateOsm,
} from '../actions/navigation';

interface Props {
  mark: Mark;
  center: Position;
  save: (data: {name: string; description: string; rate: number}) => void;
  remove?: (id: string) => void;
  cancel: () => void;
  showModal: (params: ModalParams) => void;
}

const EditMark: FC<Props> = ({
  mark,
  center,
  save,
  cancel,
  remove,
  showModal,
}) => {
  const [name, setName] = useState<string>(mark?.name || '');
  const [description, setDescription] = useState<string>(
    mark?.description || '',
  );
  const [rate, setRate] = useState<number>(mark?.rate || 0);
  const [isEdit, setIsEdit] = useState(!mark.id);
  const [createNew, setCreateNew] = useState(false);
  const {t} = useTranslation();
  const snapshotMapRef = useRef<MapboxGL.MapView>();

  const onRemove = () => {
    if (!remove) {
      return;
    }
    showModal({
      title: t('Warning!'),
      text: t('Are you sure to remove marker?', {name: name || ''}),
      actions: [
        {text: t('No'), type: ModalActionType.cancel},
        {
          text: t('Yes'),
          type: ModalActionType.default,
          handler: () => remove(mark.id?.toString() || ''),
        },
      ],
    });
  };
  const onCloseEdit = () => {
    setName(mark?.name || '');
    setDescription(mark?.description || '');
    setRate(mark?.rate || 0);
    setIsEdit(false);
  };

  const shareMark = async () => {
    try {
      const result = await Share.open({
        message: `${mark.name}: geo:${mark.geometry.coordinates[1]},${mark.geometry.coordinates[0]}`,
      });
    } catch (error: any) {
      // Alert.alert(error.message);
    }
  };

  const shareImage = async () => {
    if (!snapshotMapRef.current) {
      return;
    }
    try {
      const imgPngBase64 = await snapshotMapRef.current.takeSnap();
      await Share.open({
        message: mark.name,
        url: imgPngBase64,
      });
    } catch (error: any) {}
  };

  const distance = markToDistance(center)(mark);

  const onSetMap = (map: MapboxGL.MapView) => {
    snapshotMapRef.current = map;
  };

  const renderNavigators = () => {
    if(!mark?.geometry?.coordinates) {
        return null;
    }
    const {coordinates} = mark.geometry;
    return (
      <View style={styles.content}>
        <Button
          onPress={() => navigateYandex(coordinates)}
          buttonStyle={{backgroundColor: 'yellow'}}
          titleStyle={{color: '#000'}}
          title={t('Navigate with Yandex Navigator')}
        />
        <Divider width={5} color="#fff" />
        <Button
          onPress={() => navigateOsm(coordinates, name)}
          buttonStyle={{backgroundColor: 'green'}}
          titleStyle={{color: '#fff'}}
          title={t('Navigate with OSMAnd')}
        />
        <Divider width={5} color="#fff" />
        <Button
          onPress={() => navigateGoogle(coordinates)}
          buttonStyle={{backgroundColor: 'pink'}}
          titleStyle={{color: '#000'}}
          title={t('Navigate with Google Navigator')}
        />
      </View>
    );
  };
  const renderBlank = () => (
    <MapModal onRequestClose={cancel} accessibilityLabel="blank mark">
      <View style={styles.header}>
        <Text style={styles.title}>{t('Point')}</Text>
      </View>
      <View style={styles.content}>
        <Button onPress={() => setCreateNew(true)} title={t('Add Mark')} />
        {renderNavigators()}
      </View>
    </MapModal>
  );
  const renderEditMark = () => (
    <MapModal onRequestClose={cancel} accessibilityLabel="edit mark">
      <View style={styles.content}>
        <Text style={styles.inputLabel}>{t('Name')}:</Text>
        <TextInput
          style={styles.modalInput}
          onChangeText={value => setName(value)}
          placeholder={t('name')}
          value={name}
        />
        <Text style={styles.inputLabel}>{t('Description')}:</Text>
        <TextInput
          style={styles.modalInput}
          multiline
          numberOfLines={4}
          textAlignVertical={'top'}
          onChangeText={value => setDescription(value)}
          placeholder={t('description')}
          value={description}
        />
        <AirbnbRating
          showRating={false}
          starContainerStyle={{marginVertical: 10}}
          onFinishRating={(value: number) => setRate(value)}
          defaultRating={rate}
        />
      </View>
      <View style={styles.buttonsRow}>
        <Button
          buttonStyle={styles.btn}
          type="clear"
          onPress={() => onCloseEdit()}
          icon={<Icon name="close" size={26} color={purple} />}
        />
        <Button
          buttonStyle={styles.btn}
          type="clear"
          onPress={() => save({name, description, rate})}
          icon={<Icon name="save" size={26} color={purple} />}
        />
        {remove && (
          <Button
            buttonStyle={styles.btn}
            type="clear"
            onPress={onRemove}
            icon={<Icon name="trash" size={26} color={purple} />}
          />
        )}
      </View>
      <SnapshotMark onSetMap={onSetMap} mark={mark} />
    </MapModal>
  );
  const renderViewMark = () => (
    <MapModal onRequestClose={cancel} accessibilityLabel="info mark">
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.ratingAndDistance}>
          <Pressable disabled={true}>
            <AirbnbRating
              showRating={false}
              isDisabled={true}
              size={20}
              defaultRating={rate}
            />
          </Pressable>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>
      <View style={styles.content}>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : (
          <Text style={styles.description}>{t('no description')}</Text>
        )}
      </View>
      <View style={styles.buttonsRow}>
        <Button
          buttonStyle={styles.btn}
          type="clear"
          onPress={() => setIsEdit(true)}
          icon={<Icon name="edit" size={26} color={purple} />}
        />
        <Button
          buttonStyle={styles.btn}
          type="clear"
          onPress={shareMark}
          icon={<Icon name="share" size={26} color={purple} />}
        />
        <Button
          buttonStyle={styles.btn}
          type="clear"
          onPress={shareImage}
          icon={<Icon name="image" size={26} color={purple} />}
        />
      </View>
      {renderNavigators()}
      <SnapshotMark onSetMap={onSetMap} mark={mark} />
    </MapModal>
  );

  if (!mark?.id && !createNew && isEdit) {
    return renderBlank();
  } else if (isEdit) {
    return renderEditMark();
  } else {
    return renderViewMark();
  }
};

const styles = StyleSheet.create({
  header: {
    marginTop: -10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    maxWidth: '90%',
    marginBottom: 10,
    color: 'black',
    fontSize: 24,
    fontWeight: '700',
  },
  ratingAndDistance: {
    marginLeft: -5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  distanceText: {
    marginLeft: 10,
    color: '#aaa',
    fontSize: 18,
  },
  content: {
    marginTop: 25,
    minWidth: '100%',
  },
  description: {
    color: '#555',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 10,
  },
  buttonsRow: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  btn: {
    paddingHorizontal: 10,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  inputLabel: {
    marginBottom: 5,
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  modalInput: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    alignItems: 'flex-start',
    marginBottom: 10,
    minWidth: '100%',
    maxHeight: 90,
    color: 'black',
  },
});

export default EditMark;
