/**
 * @providesModule ManageStockView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    ActionSheetIOS,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const Dimensions = require('Dimensions');
const HEIGHT = Dimensions.get('window').height;

import TextInputLabelView from 'TextInputLabelView';

const AppStorageActions = require('AppStorageActions');
const WatchListStorageActions = require('WatchListStorageActions');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 7,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
    },

    releaseDateContainer: {
        flex: 1, height: 48,
        padding: 14,
        paddingBottom: 0,
    },
    releaseDateContentContainer: {
        flex: 1,
        paddingBottom: 14,
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },
    releaseDateTextContainer: {
        position: 'absolute',
        top: 0, left: 0,
    },
    releaseDateTitleText: {
        lineHeight: 20,
        fontSize: 16,
        color: '#000000',
        opacity: 0.87,
    },
    releaseDateFormattedTextContainer: {
        position: 'absolute',
        top: 0, right: 0,
    },
    releaseDateFormattedText: {
        lineHeight: 20,
        fontSize: 16,
        color: '#1E88E5',
        opacity: 1,
    },

    selectionContainer: {
        minHeight: 48,
        padding: 14,
        paddingTop: 0,
        paddingBottom: 0,
    },
    borderTop: {
        borderColor: 'rgba(0,0,0,0.12)',
        borderTopWidth: 1,
    },
    borderBottom: {
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },
    listButtonTextContainer: {
        flex: 1,
        paddingTop: 14,
        paddingBottom: 14,
    },
    listButtonText: {
        textAlign: 'left',
        fontSize: 16,
        color: '#1E88E5',
        opacity: 1,
    },
});

export default class ManageStockView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refListView: null,

            textInputPressPosition: 0,
            scrollPosition: 0,
            keyboardHeight: 0,
            keyboardWillChangeFrameListener: null,
            keyboardWillShowListener: null,
        };
    }

    componentWillMount() {
        this.state.keyboardWillChangeFrameListener = Keyboard.addListener('keyboardWillChangeFrame', (e) => {
            if (this.state.keyboardHeight !== e.endCoordinates.height) {
                this.state.keyboardHeight = e.endCoordinates.height;
            }
        });
        this.state.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
            if (this.state.keyboardHeight !== e.endCoordinates.height) {
                this.state.keyboardHeight = e.endCoordinates.height;
            }

            if (this.state.refListView && HEIGHT - this.state.keyboardHeight - 48 <= this.state.textInputPressPosition) {
                let scrollToPositionY = this.state.scrollPosition + (this.state.textInputPressPosition - (HEIGHT - this.state.keyboardHeight - 48));

                if (scrollToPositionY > 0) {
                    this.state.refListView.scrollTo({
                        x: 0,
                        y: scrollToPositionY,
                        animated: true,
                    });
                }
                else {
                    this.state.refListView.scrollTo({
                        x: 0,
                        y: 0,
                        animated: true,
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        // remove keyboard listeners
        if (this.state.keyboardWillChangeFrameListener) {
            this.state.keyboardWillChangeFrameListener.remove();
        }
        if (this.state.keyboardWillShowListener) {
            this.state.keyboardWillShowListener.remove();
        }
    }

    render() {
        /*
        let releaseDateFormatted =
            <View style={styles.releaseDateFormattedTextContainer}>
                <Text style={styles.releaseDateFormattedText}>
                    {'Set a Release Date'}
                </Text>
            </View>
        ;
        if (this.state.releaseDateFormatted) {
            releaseDateFormatted =
                <View style={styles.releaseDateFormattedTextContainer}>
                    <Text style={styles.releaseDateFormattedText}>
                        {this.state.releaseDateFormatted}
                    </Text>
                </View>
            ;
        }

        <TouchableWithoutFeedback onPress={this._setDatePickerView.bind(this)}>
                    <View style={styles.releaseDateContainer}>
                        <View style={styles.releaseDateContentContainer}>
                            <View style={styles.releaseDateTextContainer}>
                                <Text style={styles.releaseDateTitleText}>
                                    {'Buy In Date'}
                                </Text>
                            </View>
                            {releaseDateFormatted}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
        */

        /*
        buyInDate: string
            buyInPrice: number
            sector: string
            shares: number
         */

        return (
            <View
                style={styles.container}
            >
                <ScrollView
                    ref={(listView) => {
                        this.state.refListView = listView;
                    }}
                    style={styles.scrollViewContainer}
                    onScroll={this._onScroll.bind(this)}
                    removeClippedSubviews={false}
                >
                    <TextInputLabelView
                        value={this.state.buyInPrice}
                        valueUpdated={(value) => {
                            this.setState({
                                buyInPrice: value,
                            });
                        }}
                        onPressNativeEvent={this._setTextInputPressPosition.bind(this)}
                        onTextInputLayoutChange={this._onTextInputLayoutChange.bind(this)}
                        textInputLabel={"Buy In Price"}
                        maxLength={255}
                        disableReturn={true}
                    />

                    <TextInputLabelView
                        value={this.state.shares}
                        valueUpdated={(value) => {
                            this.setState({
                                shares: value,
                            });
                        }}
                        onPressNativeEvent={this._setTextInputPressPosition.bind(this)}
                        onTextInputLayoutChange={this._onTextInputLayoutChange.bind(this)}
                        textInputLabel={"Shares"}
                        maxLength={255}
                        disableReturn={true}
                    />
                    <TextInputLabelView
                        value={this.state.sector}
                        valueUpdated={(value) => {
                            this.setState({
                                sector: value,
                            });
                        }}
                        onPressNativeEvent={this._setTextInputPressPosition.bind(this)}
                        onTextInputLayoutChange={this._onTextInputLayoutChange.bind(this)}
                        textInputLabel={"Sector"}
                        maxLength={255}
                        disableReturn={true}
                    />
                    <TextInputLabelView
                        value={this.state.note}
                        valueUpdated={(value) => {
                            this.setState({
                                note: value,
                            });
                        }}
                        onPressNativeEvent={this._setTextInputPressPosition.bind(this)}
                        onTextInputLayoutChange={this._onTextInputLayoutChange.bind(this)}
                        textInputLabel={"Note"}
                        maxLength={255}
                    />
                    <TouchableWithoutFeedback onPress={this._editStock.bind(this)}>
                        <View style={[styles.selectionContainer, {
                            marginBottom: (this.state.keyboardHeight + 48),
                        }]}>
                            <View style={[styles.listButtonTextContainer]}>
                                <Text style={styles.listButtonText}>
                                    {'Settings'}
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </View>
        );
    }

    _onScroll(e) {
        this.state.scrollPosition = e.nativeEvent.contentOffset.y;
    }

    _setTextInputPressPosition(nativeEvent) {
        this.state.textInputPressPosition = nativeEvent.pageY;
    }

    _onTextInputLayoutChange(nativeEvent) {
        if (this.state.refListView) {
            let scrollToPositionY = this.state.scrollPosition + nativeEvent.heightChange;

            if (scrollToPositionY > 0) {
                this.state.refListView.scrollTo({
                    x: 0,
                    y: scrollToPositionY,
                    animated: false,
                });
            }
            else {
                this.state.refListView.scrollTo({
                    x: 0,
                    y: 0,
                    animated: false,
                });
            }
        }
    }

    _editStock(data) {
        let buttons = [
            'Remove Stock',
            'Cancel',
        ];
        let destructiveIndex = 0;
        let cancelIndex = 1;

        ActionSheetIOS.showActionSheetWithOptions({
                message: data.symbol,
                options: buttons,
                cancelButtonIndex: cancelIndex,
                destructiveButtonIndex: destructiveIndex,
            },
            (buttonIndex) => {
                // remove stock from watchList
                if (buttonIndex === 0) {
                    WatchListStorageActions.removeFromData(data)
                        .then(() => {
                            // successfully added new stock to watch list
                            WatchListStorageActions.emitter.emit('watchListLoadDate', Date.now());
                        })
                        .catch((errorMessage) => {
                            // an error occured when trying to add stock symbol to local storage
                            AppStorageActions.emitter.emit('setError', errorMessage);
                        });
                }
            });
    }
}