import React, { FC, useRef, useEffect, useState } from "react";
import { Animated, View, StyleSheet, PanResponder, PanResponderGestureState, GestureResponderEvent, LayoutChangeEvent } from "react-native";
import { purple } from "../constants/color";

interface Props {
    value: number;
    setValue: (value: number) => void;
}

const Slider: FC<Props> = ({ value, setValue }) => {
    const [containerWidth, setContainerWidth] = useState(1);
    const pan = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        pan.addListener(({ value }) => {
            console.log('on change', value, containerWidth);
            setValue(value / containerWidth);
        })
        return () => pan.removeAllListeners();
    }, [pan, containerWidth]);

    const panResponder = useRef(PanResponder.create({
        onPanResponderMove: Animated.event(
            [null, { dx: pan }],
            { useNativeDriver: false }
        ),
        onMoveShouldSetPanResponder: () => { console.log('pan'); return true },
        onPanResponderGrant: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            console.log('grant', value, gestureState.dx, e.nativeEvent.locationX);
            pan.setOffset(e.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
            pan.flattenOffset();
        },
    })).current;
    const onLayout = (e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        setContainerWidth(width);
        pan.setOffset(width * value);
    }
    const rightWidth = Animated.subtract(containerWidth, pan);
    const thumbPosition = Animated.subtract(pan, 20);
    const position = pan;
    return (<View style={styles.slider} onLayout={onLayout}>
        <Animated.View style={styles.touchArea} {...panResponder.panHandlers}>
            <Animated.View style={StyleSheet.flatten([styles.left, { left: 0, width: position }])} pointerEvents="none" />
            <Animated.View style={StyleSheet.flatten([styles.right, { right: 0, width: rightWidth }])} pointerEvents="none" />
            <Animated.View style={StyleSheet.flatten([styles.thumbStyle, { left: thumbPosition }])} pointerEvents="none" />
        </Animated.View>
    </View>)
}

const styles = StyleSheet.create({
    slider: {
        position: "relative",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.3)',
        flex: 1,
        justifyContent: "center",
        zIndex: 9999,
    },
    touchArea: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    thumbStyle: {
        position: "absolute",
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: purple,
    },
    left: {
        position: "absolute",
        height: 2,
        top: 19,
        backgroundColor: '#f00',
    },
    right: {
        position: "absolute",
        height: 2,
        top: 19,
        backgroundColor: purple,
    },
})

export default Slider