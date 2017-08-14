/**
 * @providesModule EmptyView
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#F5F5F5'
    }
});

export default class EmptyView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.container}>

            </View>
        );
    }
}