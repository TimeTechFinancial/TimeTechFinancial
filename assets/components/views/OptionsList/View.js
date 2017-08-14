/**
 * @providesModule OptionsListView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import WatchListView from 'WatchListView';
import OptionsListRowView from 'OptionsListRowView';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        borderColor: '#EBEBEB',
        borderTopWidth: 1,
    },
});

export default class OptionsListView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                >
                    <OptionsListRowView
                        buttonText={"Watch List"}
                        onButtonPress={this._setWatchListView.bind(this)}
                    />
                    <OptionsListRowView
                        buttonText={"Next Button Here"}
                    />
                </ScrollView>
            </View>
        );
    }

    _setWatchListView() {
        this.props.navigation.navigate('WatchListView');
    }
}