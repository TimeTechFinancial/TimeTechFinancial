/**
 * @providesModule OptionsListView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    AsyncStorage,
    InteractionManager,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import WatchListView from 'WatchListView';
import LoadingReloadView from 'LoadingReloadView';
import OptionsListRowView from 'OptionsListRowView';

const AsyncStorageKeys = require('AsyncStorageKeys');

const AppStorageActions = require('AppStorageActions');
const WatchListStorageActions = require('WatchListStorageActions');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {},

    investmentContainer: {
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
    investmentTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    investmentTitleText: {
        fontSize: 22,
        fontWeight: '300',
    },
    investmentValueInfoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    investmentValueContainer: {
        paddingRight: 0,
    },
    investmentValueText: {
        fontSize: 22,
        fontWeight: '300',
    },
    investmentValueBoldContainer: {
        paddingRight: 14,
    },
    investmentValueBoldText: {
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

export default class OptionsListView extends Component {
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

            portfolioBalance: 0,
            portfolioBalanceFormatted: 0,
            portfolioProfits: 0,
            portfolioProfitsFormatted: 0,

            runAfterTransitionTimeout: 0,
            closingView: false,

            // refs
            refListView: null,

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
        let investmentProfitsTextColor = {
                color: '#4CAF50'
            },
            investmentProfitsBackgroundColor = {
                backgroundColor: '#4CAF50'
            };

        if (this.state.portfolioProfits < 0) {
            investmentProfitsTextColor = {
                color: '#F44336'
            };
            investmentProfitsBackgroundColor = {
                backgroundColor: '#F44336'
            };
        }

        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollContainer}
                >
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Portfolio Balance'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.portfolioBalanceFormatted}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Profits'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueBoldContainer}>
                                <Text style={[styles.investmentValueBoldText, investmentProfitsTextColor]}>
                                    {this.state.portfolioProfitsFormatted}
                                </Text>
                            </View>
                            <View style={[styles.changeContainer, investmentProfitsBackgroundColor]}>
                                <Text style={[styles.changeText]}>
                                    {this.state.portfolioProfitsChange}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <OptionsListRowView
                        buttonText={"Watch List"}
                        onButtonPress={this._setWatchListView.bind(this)}
                    />
                    <OptionsListRowView
                        buttonText={"Trades"}
                        onButtonPress={this._setTradesView.bind(this)}
                    />
                    <OptionsListRowView
                        buttonText={"Stock Data"}
                    />
                    <OptionsListRowView
                        buttonText={"Charts"}
                    />
                    <OptionsListRowView
                        buttonText={"Notes"}
                    />
                    <OptionsListRowView
                        buttonText={"Other"}
                    />
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

                    let portfolioBalance = 0,
                        portfolioProfits = 0,
                        portfolioProfitsChange = 0
                    ;

                    if (nextState.data) {
                        // check to see if stock was already added to list before inserting
                        for (let i = 0; i < nextState.data.length; i++) {
                            let obj = nextState.data[i];

                            let objLiveData = obj.liveData;
                            let objUserData = obj.userData;

                            if (objUserData.buyInPrice && objUserData.shares && objLiveData.lastTradePriceOnly) {
                                let currentPrice = parseFloat(objLiveData.lastTradePriceOnly),
                                    buyInPrice = parseFloat(objUserData.buyInPrice),
                                    shares = parseFloat(objUserData.shares);

                                portfolioBalance = portfolioBalance + (buyInPrice * shares);
                                portfolioProfits = portfolioProfits + ((currentPrice - buyInPrice) * shares);
                                portfolioProfitsChange = portfolioProfitsChange + (((currentPrice - buyInPrice) / buyInPrice) * 100);
                            }
                        }
                    }

                    nextState.portfolioBalance = portfolioBalance;
                    nextState.portfolioBalanceFormatted = '$' + portfolioBalance.toLocaleString(
                        'en-US', // use a string like 'en-US' to override browser locale
                        {minimumFractionDigits: 2}
                    );

                    nextState.portfolioProfits = portfolioProfits;
                    nextState.portfolioProfitsFormatted = '$' + portfolioProfits.toLocaleString(
                        'en-US', // use a string like 'en-US' to override browser locale
                        {minimumFractionDigits: 2}
                    );

                    nextState.portfolioProfitsChange = (Math.round(portfolioProfitsChange * 100) / 100) + '%';

                    this.setState(nextState);

                    return resolve();
                });
            } catch (error) {
                // do nothing if error exists on load, since data will be null and a fetchData will be loaded
                return resolve();
            }
        });
    }

    _setWatchListView() {
        this.props.navigation.navigate('WatchListView');
    }

    _setTradesView() {
        this.props.navigation.navigate('TradesView');
    }
}