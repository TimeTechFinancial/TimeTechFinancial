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
    AsyncStorage,
    InteractionManager,
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

const AsyncStorageKeys = require('AsyncStorageKeys');

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

        let stateProps = this.props.navigation.state.params;

        this.state = {
            // passed props
            symbol: stateProps.symbol,

            liveData: null,

            buyInDate: '',
            buyInPrice: '',
            notes: '',
            sector: '',
            shares: '',
            buyInDateOriginal: '',
            buyInPriceOriginal: '',
            notesOriginal: '',
            sectorOriginal: '',
            sharesOriginal: '',

            loadingView: true,
            loading: false,

            runAfterTransitionTimeout: 0,
            closingView: false,

            refListView: null,

            rightButtonState: null,
            rightButtonStateTimestamp: 0,

            textInputPressPosition: 0,
            scrollPosition: 0,
            keyboardHeight: 0,
            keyboardWillChangeFrameListener: null,
            keyboardWillShowListener: null,
        };
    }

    componentWillMount() {
        this.state.setHeaderSaveListener = AppStorageActions.emitter.addListener('setHeaderSave', (rightButtonStateTimestamp) => {
            if (this.state.rightButtonStateTimestamp === rightButtonStateTimestamp) {
                this._setUpdateStockUserData();
            }
        });

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

        this._getWatchListSymbolData().then(() => {
            // run after scene transition - set timeout to make sure function is called if animations hang
            let called = false;
            this.state.runAfterTransitionTimeout = setTimeout(() => {
                called = true;
                this._runAfterTransition();
            }, 500);
            InteractionManager.runAfterInteractions(() => {
                if (called) return;
                clearTimeout(this.state.runAfterTransitionTimeout);
                this._runAfterTransition();
            });
        });
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.buyInDate !== nextState.buyInDate ||
            this.state.buyInPrice !== nextState.buyInPrice ||
            this.state.notes !== nextState.notes ||
            this.state.sector !== nextState.sector ||
            this.state.shares !== nextState.shares
        ) {
            if (nextState.buyInDate !== nextState.buyInDateOriginal ||
                nextState.buyInPrice !== nextState.buyInPriceOriginal ||
                nextState.notes !== nextState.notesOriginal ||
                nextState.sector !== nextState.sectorOriginal ||
                nextState.shares !== nextState.sharesOriginal
            ) {
                if (nextState.rightButtonState !== 'save' && nextState.loading === false) {
                    let currentDate = Date.now();

                    nextProps.navigation.setParams({
                        rightButtonState: 'save',
                        rightButtonStateTimestamp: currentDate,
                    });

                    this.setState({
                        rightButtonState: 'save',
                        rightButtonStateTimestamp: currentDate,
                    });
                }
            }
            else if (
                nextState.buyInDate === nextState.buyInDateOriginal &&
                nextState.buyInPrice === nextState.buyInPriceOriginal &&
                nextState.notes === nextState.notesOriginal &&
                nextState.sector === nextState.sectorOriginal &&
                nextState.shares === nextState.sharesOriginal
            ) {
                if (nextState.rightButtonState !== null && nextState.loading === false) {
                    nextProps.navigation.setParams({
                        rightButtonState: null,
                    });

                    this.setState({
                        rightButtonState: null,
                    });
                }
            }
        }
    }

    componentWillUnmount() {
        this.state.closingView = true;
        clearTimeout(this.state.runAfterTransitionTimeout);

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
                    scrollEventThrottle={8}
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
                        value={this.state.notes}
                        valueUpdated={(value) => {
                            this.setState({
                                notes: value,
                            });
                        }}
                        onPressNativeEvent={this._setTextInputPressPosition.bind(this)}
                        onTextInputLayoutChange={this._onTextInputLayoutChange.bind(this)}
                        textInputLabel={"Notes"}
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

    _runAfterTransition() {
        if (this.state.closingView === false) {
            if (this.state.data !== null) {
                this.setState({
                    loading: false,
                    loadingView: false,
                });
            }
            // no items have been added to watch list
            else {
                this.setState({
                    loading: false,
                    loadingView: false,
                });
            }
        }
    }

    _getWatchListSymbolData() {
        return new Promise((resolve, reject) => {
            try {
                let keys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(keys, (err, stores) => {
                    let watchListStorage = {
                        data: null,
                    };

                    stores.map((result, i, store) => {
                        // get at each store's key/value so you can work with it
                        let getKey = store[i][0];
                        let value = store[i][1];
                        let parseValue = JSON.parse(value);

                        if (value !== null) {
                            switch (getKey) {
                                case AsyncStorageKeys.WatchListData:
                                    watchListStorage.data = parseValue;
                                    break;
                            }
                        }
                    });

                    if (watchListStorage.data) {
                        // check to see if stock was already added to list before inserting
                        for (let i = 0; i < watchListStorage.data.length; i++) {
                            let obj = watchListStorage.data[i];

                            if (obj.symbol === this.state.symbol) {
                                let objUserData = obj.userData;

                                this.setState({
                                    liveData: obj.liveData,

                                    buyInDate: (objUserData.buyInDate ? objUserData.buyInDate + '' : ''),
                                    buyInPrice: (objUserData.buyInPrice ? objUserData.buyInPrice + '' : ''),
                                    notes: (objUserData.notes ? objUserData.notes + '' : ''),
                                    sector: (objUserData.sector ? objUserData.sector + '' : ''),
                                    shares: (objUserData.shares ? objUserData.shares + '' : ''),
                                    buyInDateOriginal: (objUserData.buyInDate ? objUserData.buyInDate + '' : ''),
                                    buyInPriceOriginal: (objUserData.buyInPrice ? objUserData.buyInPrice + '' : ''),
                                    notesOriginal: (objUserData.notes ? objUserData.notes + '' : ''),
                                    sectorOriginal: (objUserData.sector ? objUserData.sector + '' : ''),
                                    sharesOriginal: (objUserData.shares ? objUserData.shares + '' : ''),
                                });
                                break;
                            }
                        }
                    }

                    return resolve();
                });
            } catch (error) {
                // do nothing if error exists on load, since data will be null and a fetchData will be loaded
                return resolve();
            }
        });
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

    _setUpdateStockUserData() {
        WatchListStorageActions.updateDataObject({
            symbol: this.state.symbol,
            userData: {
                buyInDate: this.state.buyInDate + '',
                buyInPrice: parseFloat(this.state.buyInPrice),
                notes: this.state.notes + '',
                sector: this.state.sector + '',
                shares: parseFloat(this.state.shares),
            }
        }).then(() => {
            this.props.navigation.setParams({
                rightButtonState: null,
            });

            this.setState({
                loading: false,
                rightButtonState: null,

                buyInDateOriginal: this.state.buyInDate,
                buyInPriceOriginal: this.state.buyInPrice,
                notesOriginal: this.state.notes,
                sectorOriginal: this.state.sector,
                sharesOriginal: this.state.shares,
            });

            WatchListStorageActions.emitter.emit('watchListLoadDate', Date.now());
        }).catch((errorMessage) => {
            this.props.navigation.setParams({
                rightButtonState: null,
            });

            this.setState({
                loading: false,
                rightButtonState: null,
            });

            // an error occured when trying to add stock symbol to local storage
            AppStorageActions.emitter.emit('setError', errorMessage);
        });
    }
}