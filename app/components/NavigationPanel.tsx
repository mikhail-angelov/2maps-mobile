import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Position} from '@turf/helpers';
import distance from '@turf/distance';
import bearing from '@turf/bearing';
import {State} from '../store/types';
import {compassAngle} from '../actions/tracker-actions';
import {selectCompass, selectLocation} from '../reducers/tracker';

const redArrowIcon = require('../assets/arrow.png');
const compassIcon = require('../assets/compass.png');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 200,
  },
  textContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 10,
  },
  styledText: {
    fontSize: 20,
    margin: 10,
    color: 'yellow',
  },
  styledButton: {
    color: 'yellow',
  },
  compass: {
    position: 'relative',
    width: 200,
    height: 200,
    border: '1px solid grey',
    borderRadius: 100,
    backgroundColor: 'grey',
    opacity: 0.7,
  },
  arrowC: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    // transform: ${(props: { angle: number }) => `rotate(${props.angle}deg)`};
  },
  arrow: {
    position: 'absolute',
    top: 0,
    left: 25,
    height: 200,
    width: 150,
    // transform: ${(props: { angle: number }) => `rotate(${props.angle}deg)`};
  },
});

interface OwnProps {
  target: Position;
  close: () => void;
}
const mapStateToProps = (state: State) => ({
  location: selectLocation(state),
  compass: selectCompass(state),
});

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector> & OwnProps;

const NavigationPanel: React.FC<Props> = ({
  location,
  target,
  compass,
  close,
}) => {
  const heading = compassAngle(compass);
  const center = [location.coords.longitude, location.coords.latitude];
  const d = target
    ? `${distance(target, center, {units: 'kilometers'}).toFixed(2)} km`
    : '';
  const s = `${(location.coords.speed || 0).toFixed(2)} km/ч`;
  const a = `${(location.coords.altitude || 0).toFixed(2)} m`;
  const azSelf = target ? bearing(center, target) : 0;
  //console.log('comp', position[0], self[0], self[1], azSelf, d)

  return (
    <View style={styles.container}>
      <View style={styles.compass}>
        <Image source={compassIcon} style={styles.arrowC} />
        <Image source={redArrowIcon} style={styles.arrow} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.styledText}>L: {d}</View>
        <View style={styles.styledText}>S: {s}</View>
        <View style={styles.styledText}>A: {a}</View>
        <Button
          onPress={close}
          title="x"
          type="clear"
          buttonStyle={{width: 150, borderColor: 'yellow'}}
        />
      </View>
    </View>
  );
};

export default connector(NavigationPanel);
