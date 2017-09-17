/**
 * @providesModule HeaderLoadingButtonView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';

import LoadingReloadView from 'LoadingReloadView';

const styles = StyleSheet.create({
    container: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },

    rightLoadingContainer: {
        width: 26, height: 26,
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});

export default class HeaderLoadingButtonView extends Component {
    render() {
        let rightView =
            <View style={styles.rightLoadingContainer}>
                <LoadingReloadView
                    size={26}
                    loading={true}
                />
            </View>
        ;

        if (this.props.color === 'light') {
            rightView =
                <View style={styles.rightLoadingContainer}>
                    <LoadingReloadView
                        size={26}
                        loading={true}
                        contentStyle={'light'}
                    />
                </View>
            ;
        }

        return (
            <View style={styles.container}>
                {rightView}
            </View>
        );
    }
}

HeaderLoadingButtonView.defaultProps = {
    navigation: () => {
    },
    rightButtonState: null,
    color: 'dark',
};