/**
 * @providesModule HeaderSaveButtonView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const AppStorageActions = require('AppStorageActions');

const styles = StyleSheet.create({
    container: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },

    rightButtonText: {
        marginRight: 14,
        marginLeft: 14,
        fontSize: 15,
        color: '#1E88E5',
        opacity: 1,
        textAlign: 'right',
        alignSelf: 'center',
    },
    rightButtonTextLight: {
        color: '#1E88E5',
        opacity: 1,
    },
});

export default class HeaderSaveButtonView extends Component {
    render() {
        // right icon
        let rightView =
            <Text style={styles.rightButtonText}>
                {'Save'}
            </Text>
        ;

        if (this.props.color === 'light') {
            rightView =
                <Text style={[styles.rightButtonText, styles.rightButtonTextLight]}>
                    {'Save'}
                </Text>;
        }

        return (
            <TouchableWithoutFeedback onPress={this._onRightButton.bind(this)}>
                <View style={styles.container}>
                    {rightView}
                </View>
            </TouchableWithoutFeedback>
        );
    }

    _onRightButton() {
        AppStorageActions.emitter.emit('setHeaderSave', this.props.rightButtonStateTimestamp);

        this.props.navigation.setParams({
            rightButtonState: 'loading',
        });
    }
}

HeaderSaveButtonView.defaultProps = {
    navigation: () => {
    },
    rightButtonState: null,
    color: 'dark',
};