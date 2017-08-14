/**
 * @providesModule HeaderBackButtonView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';

const styles = StyleSheet.create({
    container: {
        height: 48,
        paddingRight: 7,
        paddingLeft: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    icon40: {
        width: 40, height: 40,
    },
});

export default class HeaderBackButtonView extends Component {
    render() {
        // default to back < button
        let leftView =
            <Image
                style={styles.icon40}
                source={require('../../img/Back/Back40.png')}
                resizeMode={'cover'}
            />
        ;

        if (this.props.color === 'light') {
            leftView =
                <Image
                    style={styles.icon40}
                    source={require('../../img/Back/Back40Light.png')}
                    resizeMode={'cover'}
                />
            ;
        }

        return (
            <TouchableWithoutFeedback onPress={this._onLeftButton.bind(this)}>
                <View style={styles.container}>
                    {leftView}
                </View>
            </TouchableWithoutFeedback>
        );
    }

    _onLeftButton() {
        dismissKeyboard();

        if (this.props.rightButtonState) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to cancel?',
                [
                    {text: 'No'},
                    {
                        text: 'Yes', onPress: () => {
                        this.props.navigation.goBack();
                    }
                    },
                ]
            );
        }
        else {
            this.props.navigation.goBack();
        }
    }
}

HeaderBackButtonView.defaultProps = {
    navigation: () => {
    },
    rightButtonState: null,
    color: 'dark',
};