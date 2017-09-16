/**
 * @providesModule OptionsListRowView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: '#EBEBEB',
        borderBottomWidth: 1,
    },
    buttonContainer: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default class OptionsListRowView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.props.onButtonPress.bind(this)}>
                    <View style={styles.buttonContainer}>
                        <Text>
                            {this.props.buttonText}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

OptionsListRowView.defaultProps = {
    buttonText: "Press Button",
    onButtonPress: () => {
    },
};