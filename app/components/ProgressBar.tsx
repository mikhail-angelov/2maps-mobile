import React from "react";
import {
    StyleSheet,
    Text,
    View,
    LayoutAnimation
} from "react-native";

interface Props {
    progress: number;
    valueStyle?: string;
    label?: string;
    value?: number;
}
interface State {
    progress: number;
    init_animation: boolean;
}



export default class ProgressBar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            progress: props.progress,
            init_animation: false,
        }
    }

    componentDidMount() {
        LayoutAnimation.spring()
        setTimeout(() => {
            this.setState({ progress: this.props.progress })
        }, 0)
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        this.setState({ progress: nextProps.progress })
    }

    UNSAFE_componentWillUpdate() {
        LayoutAnimation.spring()
    }

    render() {
        let value: React.ReactNode = null
        let valueBalloon: React.ReactNode = null
        let label: React.ReactNode = null
        let marginTop = 0

        switch (this.props.valueStyle) {
            case 'balloon':
                valueBalloon = (
                    <View style={styles.flexBox}>
                        <View style={[{ flex: this.state.progress }]}>
                            <View style={styles.progressBar__balloon}>
                                <View style={styles.progressBar__balloonArrow}></View>
                                <Text style={styles.progressBar__balloonVal}>{this.state.progress}%</Text>
                            </View>
                        </View>
                        <View style={[{ flex: 100 - this.state.progress }]}></View>
                    </View>
                )
                marginTop = 30

                break
            case 'none':
                break
            default:
                value = (
                    <View style={styles.progressBar_mes}>
                        <Text style={styles.progressBar__val}>{this.state.progress}%</Text>
                    </View>
                )
                break
        }

        if (this.props.valueStyle !== 'balloon' && this.props.label) {
            marginTop = 20
            label = (
                <View style={styles.labelWrap}>
                    <Text style={styles.label}>{this.props.label} {this.props.value && `: ${this.props.value}`}</Text>
                </View>
            )
        }

        const leftStyle = StyleSheet.flatten([styles.progressBar_left, { flex: this.state.progress }]);
        const rightStyle = StyleSheet.flatten([styles.progressBar_right, { flex: 100 - this.state.progress }]);
       
        var chart = (
            <View >
                {/* {valueBalloon}
        {label} */}
                <View style={styles.progressBar}>
                    <View style={leftStyle}>
                        <View style={styles.progressBar_mes}>
                            <Text style={styles.progressBar__val}>{this.state.progress}%</Text>
                        </View>
                    </View>
                    <View style={rightStyle}></View>
                </View>

            </View>
        )
        return chart
    }
}


const styles = StyleSheet.create({
    flexBox: {
        flex: 1,
        flexDirection: 'row',
    },
    d: {
        borderWidth: 1,
        borderColor: '#000',
    },
    progressBar: {
        // overflow: 'hidden',
        // height: 30,
        borderWidth: 2,
        borderColor: 'rgb(0, 122, 255)',
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 5,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    progressBar_left: {
        backgroundColor: '#62aeff',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        height: 30,
    },
    progressBar_right: {
        backgroundColor: '#fff',
        height: 30,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    progressBar_mes: {
        position: 'absolute',
        right: 0,
        paddingRight: 5,
        backgroundColor: 'rgba(0,0,0,0)',
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
    },
    progressBar__balloon: {
        position: 'absolute',
        padding: 3,
        right: -15,
        backgroundColor: '#62aeff',
        borderRadius: 2,
        paddingRight: 5,
        flexDirection: 'row',
    },
    progressBar__balloonArrow: {
        position: 'absolute',
        bottom: -10,
        right: 0,
        backgroundColor: '#62aeff',
        borderRadius: 30,
        width: 30,
        height: 30,
    },
    progressBar__val: {
        // textAlign: 'center',
        color: '#fff',
        // lineHeight: 30,
    },
    progressBar__balloonVal: {
        textAlign: 'center',
        color: '#fff',
        // lineHeight: 30,
    },
    labelWrap: {
        position: 'absolute',
        top: 0,
        left: .2,
    },
    label: {
        color: 'rgb(0, 122, 255)',
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        textAlign: 'center'
    }
})
