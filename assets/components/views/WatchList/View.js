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
const AppStorageActions = require('AppStorageActions');

const Dimensions = require('Dimensions');
const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5'
    },
    bodyContainer: {},
    noContentContainer: {
        flex: 1,
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

    stockSymbolTextInput: {
        width: WIDTH, height: 40,
        borderColor: '#EBEBEB',
        borderWidth: 1,
        padding: 14,
        textAlign: "center",
        fontSize: 14,
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

            hasMorePages: true,
            loadDate: null,
            cursor: null,
            data: null,
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
            dataSourceKeys: null,

            // refs
            refListView: null,

            stockSymbol: '',

            // requests
            fetchDataRequestObject: null,
        };
    }

    componentWillMount() {
        this._fetchData();
    }

    componentWillUnmount() {
        if (this.state.fetchDataRequestObject) {
            this.state.fetchDataRequestObject.abort();
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
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.noContentContainer}>
                        <Text style={styles.noContentText}>
                            {"Your Watch List is Empty"}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            ;
            if (this.state.data) {
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
        }

        return (
            <View style={styles.container}>
                <View style={styles.bodyContainer}>
                    <TextInputLabelView
                        value={this.state.stockSymbol}
                        valueUpdated={(value) => {
                            this.setState({
                                stockSymbol: value,
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
                                {data.LastTradePriceOnly}
                            </Text>
                        </View>
                        <View style={[styles.changeContainer, stockBackgroundColor]}>
                            <Text style={[styles.changeText]}>
                                {data.Change}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    _onRefresh() {
        if (this.loading === false && this.refreshing === false) {
            this.setState({
                refreshing: true,
            });

            this._fetchData();
        }
    }

    _fetchData() {
        try {
            AsyncStorage.getItem('@WatchList:key', (err, value) => {
                // Load watch list from WatchList:key
                if (value !== null) {
                    // Parse saved WatchList array to JSON object.
                    let watchListArray = JSON.parse(value),
                        watchListSymbolsCsv = '';

                    // populate array of symbols to load from yahoo
                    for (let i = 0; i < watchListArray.length; i++) {
                        if (i === 0) {
                            watchListSymbolsCsv = watchListArray[i].symbol
                        }
                        else {
                            watchListSymbolsCsv = watchListSymbolsCsv + ',' + watchListArray[i].symbol
                        }
                    }

                    if (watchListSymbolsCsv !== '') {
                        this._fetchDataRequest(watchListSymbolsCsv);
                    }
                    // no data has been loaded
                    else {
                        this.setState({
                            loadingView: false
                        });
                    }
                }
                // no items have been added to watch list
                else{
                    this.setState({
                        loadingView: false
                    });
                }
            });
        } catch (error) {
            AppStorageActions.emitter.emit('setError', 'Error Retrieving Watch List');
        }
    }

    _fetchDataRequest(symbols) {
        // prevent overloading
        if (this.state.loading) {
            return false;
        }

        this.setState({
            loading: true,
        });

        // on load - this endpoint loads either Recent Activity or Profile List for user
        let requestURL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + symbols + '%22)%0A%09%09&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

        this.state.fetchDataRequestObject =
            Request
                .get(requestURL)
                .timeout(ApiConstants.TIMEOUT)
                .end((err, res) => {
                    if (err) {
                        AppStorageActions.emitter.emit('setError', 'Error Connecting to Yahoo Finance');

                        // error loading - display reload
                        this.setState({
                            refreshing: false,
                            loadingView: false,
                            loading: false,
                            reload: true,
                            reloadFunction: this._fetchDataRequest,
                            reloadData: symbols,
                        });
                    }
                    else if (res) {
                        let data = res.body.query.results.quote;

                        if (Array.isArray(data)) {

                        }
                        else {
                            data = [res.body.query.results.quote];
                        }

                        this.setState({
                            data: data,
                            dataSource: this.state.dataSource.cloneWithRows(data),
                            refreshing: false,
                            loadingView: false,
                            loading: false,
                            stockSymbol: '',
                        });
                    }
                    else {
                        AppStorageActions.emitter.emit('setError', 'Error Saving Data');

                        // error loading - display reload
                        this.setState({
                            refreshing: false,
                            loadingView: false,
                            loading: false,
                            reload: true,
                            reloadFunction: this._fetchDataRequest,
                            reloadData: symbols,
                        });
                    }
                });
    }

    _addNewStockSymbol() {
        if (this.state.stockSymbol === null || this.state.stockSymbol === '') {
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
        let requestURL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + this.state.stockSymbol + '%22)%0A%09%09&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

        this.state.fetchDataRequestObject =
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

                        if (data.LastTradePriceOnly) {
                            this._addStockSymbolToStorage(data);
                        }
                        else {
                            AppStorageActions.emitter.emit('setError', 'Invalid Stock Symbol');

                            this.setState({
                                loading: false,
                            });
                        }
                    }
                });
    }

    _addStockSymbolToStorage(data) {
        try {
            AsyncStorage.getItem('@WatchList:key', (err, value) => {
                // Add new data to top of watch list if WatchList:key exists.
                if (value !== null) {
                    // Parse saved WatchList array to JSON object.
                    let watchListArray = JSON.parse(value),
                        symbolExists = false;

                    // search array to make sure user has not already added this stock symbol
                    for (let i = 0; i < watchListArray.length; i++) {
                        if (watchListArray[i].symbol === data.symbol) {
                            symbolExists = true;

                            break;
                        }
                    }

                    // Symbol already exists so no need to add it to watchListArray
                    if (symbolExists) {
                        AppStorageActions.emitter.emit('setNotification', 'This Symbol Has Already Been Added');

                        this.setState({
                            loading: false,
                            stockSymbol: '',
                        });
                    }
                    else {
                        // Add new symbol data to the top of the array.
                        watchListArray.unshift(data);

                        // Prepare data to be saved by converting JSON object back to string.
                        let stringifyData = JSON.stringify(watchListArray);

                        AsyncStorage.setItem('@WatchList:key', stringifyData, (error) => {
                            this.setState({
                                loading: false,
                                stockSymbol: '',
                            });

                            // update all watch list stock symbols on save
                            this._fetchData();
                        });
                    }
                }
                // WatchList:key does not exist, so set using an empty array.
                else {
                    try {
                        let stringifyData = JSON.stringify([data]);

                        AsyncStorage.setItem('@WatchList:key', stringifyData, (error) => {
                            this.setState({
                                loading: false,
                                stockSymbol: '',
                            });

                            // update all watch list stock symbols on save
                            this._fetchData();
                        });
                    } catch (error) {
                        AppStorageActions.emitter.emit('setError', 'Error Saving Watch List');

                        this.setState({
                            loading: false,
                        });
                    }
                }
            });
        } catch (error) {
            AppStorageActions.emitter.emit('setError', 'Error Retrieving Watch List');

            this.setState({
                loading: false,
            });
        }
    }

    _removeStockSymbolFromStorage(data) {
        try {
            AsyncStorage.getItem('@WatchList:key', (err, value) => {
                // Add new data to top of watch list if WatchList:key exists.
                if (value !== null) {
                    // Parse saved WatchList array to JSON object.
                    let watchListArray = JSON.parse(value),
                        symbolExists = false;

                    // search array to remove symbol
                    for (let i = 0; i < watchListArray.length; i++) {
                        if (watchListArray[i].symbol === data.symbol) {
                            symbolExists = true;
                            watchListArray.splice(i, 1);

                            break;
                        }
                    }

                    // Symbol exists so symbol was removed from watchListArray
                    if (symbolExists) {
                        // Prepare data to be saved by converting JSON object back to string.
                        let stringifyData = JSON.stringify(watchListArray);

                        AsyncStorage.setItem('@WatchList:key', stringifyData, (error) => {
                            // update data and dataSource with new watchListArray data
                            if (watchListArray.length > 0) {
                                this.setState({
                                    data: watchListArray,
                                    dataSource: this.state.dataSource.cloneWithRows(watchListArray),
                                });
                            }
                            else {
                                this.setState({
                                    data: null,
                                    dataSource: this.state.dataSource.cloneWithRows([]),
                                });
                            }
                        });
                    }
                }
            });
        } catch (error) {
            AppStorageActions.emitter.emit('setError', 'Error Retrieving Watch List');
        }
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
                    this._removeStockSymbolFromStorage(data);
                }
            });
    }
}