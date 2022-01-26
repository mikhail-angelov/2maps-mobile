import React, { FC, useEffect, useState } from "react";
import { NativeModules, View } from 'react-native';
import { BannerAd, BannerAdSize } from '@react-native-admob/admob';
import { State } from "../store/types";
import { connect, ConnectedProps } from "react-redux";
import { selectShowAdMob } from "../reducers/auth";

const unitId = process.env.ADMOB_BANNER_UNIT_ID || ''

const mapStateToProps = (state: State) => ({
  showAdMob: selectShowAdMob(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector>

const AdMob: FC<Props> = ({showAdMob}) => {
  const [isTestDevice, setIsTestDevice] = useState(true)

  useEffect(() => {
    NativeModules.MapsModule.isTestDevice().then(setIsTestDevice)
  }, [])

  return <View>
    {!isTestDevice && !!showAdMob && <BannerAd size={BannerAdSize.ADAPTIVE_BANNER} unitId={unitId} onAdFailedToLoad={(error) => console.error(error)} />}
  </View>
};

export default connector(AdMob)