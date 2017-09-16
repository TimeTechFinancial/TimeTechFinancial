/**
 * @providesModule WatchListView
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
    ListView,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import LoadingReloadView from 'LoadingReloadView';
import TextInputLabelView from 'TextInputLabelView';

const Request = require('superagent');
const ApiConstants = require('ApiConstants');
const AsyncStorageKeys = require('AsyncStorageKeys');

const AppStorageActions = require('AppStorageActions');
const WatchListStorageActions = require('WatchListStorageActions');

const Dimensions = require('Dimensions');
const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5'
    },
    bodyContainer: {
        backgroundColor: '#F5F5F5'
    },
    noContentContainer: {
        flex: 1, height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noContentText: {
        padding: 14,
        paddingBottom: 48,
        fontSize: 16,
        fontWeight: '300',
        color: '#000000',
        opacity: 0.54,
    },

    listViewContentContainer: {
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    listViewContent: {
        overflow: 'hidden',
        backgroundColor: '#F5F5F5'
    },
    stockContainer: {
        marginLeft: 14,
        marginRight: 14,
        paddingTop: 14,
        paddingBottom: 14,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },
    symbolContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolText: {
        fontSize: 22,
        fontWeight: '300',
    },
    stockPriceInfoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    currentPriceContainer: {
        paddingRight: 14,
    },
    currentPriceText: {
        fontSize: 22,
        fontWeight: '600',
    },
    changeContainer: {
        paddingTop: 4, paddingBottom: 4,
        paddingLeft: 7, paddingRight: 7,
        borderRadius: 6,
    },
    changeText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#F5F5F5',
    },
});

export default class WatchListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            reload: false,
            reloadFunction: () => {
            }, // function used to reload correct function
            reloadData: null, // optional reloadData option to load with reloadFunction

            loadingView: true,
            loading: false,
            data: null,
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),

            runAfterTransitionTimeout: 0,
            closingView: false,

            // refs
            refListView: null,

            newStockSymbol: '',

            // emitters
            watchListLoadDate: Date.now(),
            watchListLoadDateListener: null,

            // requests
            addNewStockSymbolRequestObject: null,
        };
    }

    componentWillMount() {
        this.state.watchListLoadDateListener = WatchListStorageActions.emitter.addListener('watchListLoadDate', (loadDate) => {
            if (this.state.watchListLoadDate !== loadDate) {
                this.state.watchListLoadDate = loadDate;

                this._getWatchListData();
            }
        });

        this._getWatchListData().then(() => {
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

    componentWillUnmount() {
        this.state.closingView = true;
        clearTimeout(this.state.runAfterTransitionTimeout);

        // remove emitter listeners
        if (this.state.watchListLoadDateListener) {
            this.state.watchListLoadDateListener.remove();
        }

        // abort active requests
        if (this.state.addNewStockSymbolRequestObject) {
            this.state.addNewStockSymbolRequestObject.abort();
        }
    }

    render() {
        let listViewContent;

        if (this.state.loadingView) {
            listViewContent =
                <LoadingReloadView
                    loading={true}
                    size={24}
                    thickness={1}
                />
            ;
        }
        else {
            listViewContent =
                <ListView
                    ref={(listView) => {
                        this.state.refListView = listView;
                    }}
                    style={styles.listViewContent}
                    contentContainerStyle={[styles.listViewContentContainer]}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                        />
                    }
                    onEndReachedThreshold={24}
                    scrollsToTop={false}
                    scrollEventThrottle={10}
                    initialListSize={24}
                />
            ;
        }

        return (
            <View style={styles.container}>
                <View style={styles.bodyContainer}>
                    <TextInputLabelView
                        value={this.state.newStockSymbol}
                        valueUpdated={(value) => {
                            this.setState({
                                newStockSymbol: value,
                            });
                        }}
                        textInputLabel={"Enter Stock Symbol"}
                        maxLength={5}
                        returnKeyType={'go'}
                        autoCapitalize={'characters'}
                        autoCorrect={false}
                        disableReturn={true}
                        submitButton={true}
                        onSubmitEditing={this._addNewStockSymbol.bind(this)}
                    />
                </View>
                {listViewContent}
            </View>
        );
    }

    _renderRow(data, sectionId, rowId) {
        if (typeof data !== 'undefined') {
            if (typeof data.emptyList !== 'undefined') {
                return (
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={styles.noContentContainer}>
                            <Text style={styles.noContentText}>
                                {"Your Watch List is Empty"}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                );
            }
            else {
                let stockTextColor = {
                        color: '#4CAF50'
                    },
                    stockBackgroundColor = {
                        backgroundColor: '#4CAF50'
                    };

                if (data.Change < 0) {
                    stockTextColor = {
                        color: '#F44336'
                    };
                    stockBackgroundColor = {
                        backgroundColor: '#F44336'
                    };
                }

                return (
                    <TouchableWithoutFeedback onPress={() => {
                        this._editSymbol(data)
                    }}>
                        <View style={styles.stockContainer}>
                            <View style={styles.symbolContainer}>
                                <Text style={styles.symbolText}>
                                    {data.symbol}
                                </Text>
                            </View>
                            <View style={styles.stockPriceInfoContainer}>
                                <View style={styles.currentPriceContainer}>
                                    <Text style={[styles.currentPriceText, stockTextColor]}>
                                        {data.liveData.lastTradePriceOnly}
                                    </Text>
                                </View>
                                <View style={[styles.changeContainer, stockBackgroundColor]}>
                                    <Text style={[styles.changeText]}>
                                        {data.liveData.change}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                );
            }
        }
        else {
            return null;
        }
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

    _setDataSource(data) {
        let newData = data.slice(0);

        if (data.length === 0) {
            newData = newData.concat([{
                emptyList: true,
                loadDate: Date.now(),
            }]);
        }

        return newData;
    }

    _getWatchListData() {
        return new Promise((resolve, reject) => {
            try {
                let keys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(keys, (err, stores) => {
                    let nextState = {
                        data: null,
                    };

                    stores.map((result, i, store) => {
                        // get at each store's key/value so you can work with it
                        let key = store[i][0];
                        let value = store[i][1];
                        let parseValue = JSON.parse(value);

                        if (value !== null) {
                            switch (key) {
                                case AsyncStorageKeys.WatchListData:
                                    nextState.data = parseValue;
                                    break;
                            }
                        }
                    });


                    if (nextState.data !== null) {
                        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
                            dataSource = this._setDataSource(nextState.data);

                        nextState.dataSource = ds.cloneWithRows(dataSource);
                    }

                    this.setState(nextState);

                    return resolve();
                });
            } catch (error) {
                // do nothing if error exists on load, since data will be null and a fetchData will be loaded
                return resolve();
            }
        });
    }

    _onRefresh() {
        if (this.state.loading === false && this.state.refreshing === false) {
            this.setState({
                refreshing: true,
            });

            WatchListStorageActions.refreshLiveData()
                .then(() => {
                    this.setState({
                        refreshing: false,
                    });
                })
                .catch(() => {
                    this.setState({
                        refreshing: false,
                    });
                });
        }
    }

    _addNewStockSymbol() {
        if (this.state.newStockSymbol === null || this.state.newStockSymbol === '') {
            AppStorageActions.emitter.emit('setError', 'Please Enter a Stock Symbol');

            return false;
        }

        // prevent overloading
        if (this.state.loading) {
            return false;
        }

        this.setState({
            loading: true,
        });

        // on load - this endpoint loads either Recent Activity or Profile List for user
        let requestURL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + this.state.newStockSymbol + '%22)%0A%09%09&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

        this.state.addNewStockSymbolRequestObject =
            Request
                .get(requestURL)
                .timeout(ApiConstants.TIMEOUT)
                .end((err, res) => {
                    if (err) {
                        AppStorageActions.emitter.emit('setError', 'Error Connecting to Yahoo Finance');

                        this.setState({
                            loading: false,
                        });
                    }
                    else if (res) {
                        let data = res.body.query.results.quote;

                        WatchListStorageActions.insertData(data)
                            .then(() => {
                                // successfully added new stock to watch list
                                WatchListStorageActions.emitter.emit('watchListLoadDate', Date.now());

                                this.setState({
                                    loading: false,
                                    newStockSymbol: '',
                                });
                            })
                            .catch((errorMessage) => {
                                // an error occured when trying to add stock symbol to local storage
                                AppStorageActions.emitter.emit('setError', errorMessage);

                                this.setState({
                                    loading: false,
                                });
                            });
                    }
                });
    }

    _editSymbol(data) {
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