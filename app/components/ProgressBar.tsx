import React from 'react';
import {StyleSheet, Text, View, LayoutAnimation} from 'react-native';

interface Props {
  progress: number;
}
interface State {
  progress: number;
}

export default class ProgressBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      progress: props.progress,
    };
  }

  componentDidMount() {
    LayoutAnimation.spring();
    setTimeout(() => {
        this.setState({ progress: this.props.progress })
    }, 0)
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    this.setState({ progress: nextProps.progress })
  }

  UNSAFE_componentWillUpdate() {
    LayoutAnimation.spring();
  }

  render() {
    const leftStyle = StyleSheet.flatten([
      styles.progressBar_left,
      {flex: this.state.progress},
    ]);
    const rightStyle = StyleSheet.flatten([
      styles.progressBar_right,
      {flex: 100 - this.state.progress},
    ]);

    return (
      <View style={styles.progressBar}>
        <View style={leftStyle}>
          <View style={styles.progressBar_mes}>
            {this.state.progress > 7 && <Text style={styles.progressBar__val}>{this.state.progress}%</Text>}
          </View>
        </View>
        <View style={rightStyle}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  progressBar: {
    marginHorizontal: 10,
    marginBottom: 5,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgb(0, 122, 255)',
  },
  progressBar_left: {
    backgroundColor: '#62aeff',
    height: 30,
  },
  progressBar_right: {
    backgroundColor: '#fff',
    height: 30,
  },
  progressBar_mes: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingRight: 5,
    backgroundColor: 'rgba(0,0,0,0)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  progressBar__val: {
    color: '#fff',
  },
});
