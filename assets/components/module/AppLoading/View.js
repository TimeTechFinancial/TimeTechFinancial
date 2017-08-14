/**
 * @providesModule AppLoadingView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },

    contentContainer: {
        position: 'absolute',
        top: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight), right: 0,
        bottom: 0, left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    footerContainer: {
        height: 48,
        position: 'absolute',
        right: 0,
        bottom: 0, left: 0,
    },
});

export default class AppLoadingView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.contentContainer}>

                </View>
                <View style={styles.footerContainer}>

                </View>
            </View>
        );
    }
}