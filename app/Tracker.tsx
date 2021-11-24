import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { setCompassAction, setLocationAction } from './actions/tracker-actions'

const mapDispatchToProps = {
  setCompass: setCompassAction,
  setLocation: setLocationAction,
};
const connector = connect(null, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>


const Tracker: React.FC<Props> = ({ setCompass, setLocation }) => {
  // useEffect(() => {
  //   let sub: { remove: () => void } | undefined;
  //   const subscription = Magnetometer.addListener(compass => setCompass(compass))
  //   Magnetometer.setUpdateInterval(200);

  //   (async () => {
  //     const isEnabled = await Location.hasServicesEnabledAsync()
  //     console.log('isEnabled', isEnabled)
  //     if (!isEnabled) {
  //       return
  //     }
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.log('Permission to access location was denied');
  //       return;
  //     }
  //     console.log('status', status);

  //     let location = await Location.getLastKnownPositionAsync();
  //     console.log('location!!', location);

  //     sub = await Location.watchPositionAsync({timeInterval: 200, distanceInterval: 10}, (newLocation) => {
  //       console.log('+location', newLocation)
  //       setLocation(newLocation)
  //     })


  //   })();

  //   return () => {
  //     subscription && subscription.remove();
  //     sub && sub.remove();

  //     console.log('stop tracking');
  //   }
  // }, [])


  return <></>
}

export default connector(Tracker)