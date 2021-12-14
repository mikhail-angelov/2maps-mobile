import React, { FC } from "react";
import { View } from 'react-native';
import { BannerAd, TestIds, BannerAdSize } from '@react-native-admob/admob';
import { State } from "../store/types";
import { connect, ConnectedProps } from "react-redux";
import { selectShowAdMob } from "../reducers/auth";

const mapStateToProps = (state: State) => ({
  showAdMob: selectShowAdMob(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector>

const AdMob: FC<Props> = ({showAdMob}) => {
  return <View>
    {!!showAdMob && <BannerAd size={BannerAdSize.ADAPTIVE_BANNER} unitId={TestIds.BANNER} />}
  </View>
};

export default connector(AdMob)