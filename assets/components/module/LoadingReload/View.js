/**
 * @providesModule LoadingReloadView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    Animated,
    Image,
    TouchableWithoutFeedback,
    StyleSheet,
    View,
} from 'react-native';
import Dimensions from 'Dimensions';
import * as Progress from 'react-native-progress';

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        width: WIDTH,
        height: 62,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    loadingActivityIndicatorContainer: {
        width: 34, height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingActivityIndicator: {
        width: 20, height: 20
    },
    reloadContainer: {
        width: 30, height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        overflow: 'hidden',
    },
    icon30: {
        width: 30,
        height: 30
    }
});

export default class LoadingReloadView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingAnimation: new Animated.Value(1)
        };
    }

    render() {
        let viewContent = null;

        if (this.props.loading) {
            let activityIndicator =
                <Progress.CircleSnail
                    size={this.props.size}
                    thickness={this.props.thickness}
                    duration={800}
                    spinDuration={4000}
                    color={'rgba(0,0,0,0.87)'}
                />
            ;

            if (this.props.contentStyle === 'light') {
                activityIndicator =
                    <Progress.CircleSnail
                        size={this.props.size}
                        thickness={this.props.thickness}
                        duration={800}
                        spinDuration={4000}
                        color={'#FAFAFA'}
                    />
                ;
            }

            viewContent =
                <View style={[styles.container]}>
                    <View style={styles.loadingActivityIndicatorContainer}>
                        {activityIndicator}
                    </View>
                </View>
            ;
        }

        if (this.props.reload) {
            let refreshIcon =
                <Image
                    style={styles.icon30}
                    source={require('../../img/Refresh/Refresh30.png')}
                    resizeMode={'cover'}
                />
            ;

            if (this.props.contentStyle === 'light') {
                refreshIcon =
                    <Image
                        style={styles.icon30}
                        source={require('../../img/Refresh/Refresh30Light.png')}
                        resizeMode={'cover'}
                    />
                ;
            }

            viewContent =
                <TouchableWithoutFeedback
                    onPress={(e) => this.props.setReload()}
                >
                    <View style={[styles.container]}>
                        <View style={styles.reloadContainer}>
                            {refreshIcon}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ;
        }

        return (viewContent);
    }
}

LoadingReloadView.defaultProps = {
    size: 30,
    thickness: 2,
    loading: false,
    reload: false,
    setReload: () => {
    },
    contentStyle: 'dark',
};