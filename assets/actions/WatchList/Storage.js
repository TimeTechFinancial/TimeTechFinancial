/**
 * @providesModule WatchListStorageActions
 *
 */

'use strict';

import {
    AsyncStorage,
} from 'react-native';

const Request = require('superagent');
const ApiConstants = require('ApiConstants');
const AsyncStorageKeys = require('AsyncStorageKeys');

const AppStorageActions = require('AppStorageActions');

const {EventEmitter} = require('fbemitter');
const emitter = new EventEmitter();

/*
    Data Structure for WatchList data

    {
        symbol: string:key
        liveData {
            change: string
            daysLow: number
            daysHigh: number
            lastTradeDate: string
            lastTradePriceOnly: number
            open: number
            previousClose: number
            volume: number
        }
        userData {
            buyInDate: string
            buyInTime: string
            buyInPrice: number
            notes: string
            sector: string
            shares: number
        }
    }
*/

let refreshLiveData = {
    loading: false,
};

module.exports = {
    emitter: emitter,

    setLiveData: function (data) {
        return {
            change: data.PercentChange + '',
            daysLow: parseFloat(data.DaysLow),
            daysHigh: parseFloat(data.DaysHigh),
            lastTradeDate: data.LastTradeDate + '',
            lastTradePriceOnly: parseFloat(data.LastTradePriceOnly),
            open: parseFloat(data.Open),
            previousClose: parseFloat(data.PreviousClose),
            volume: parseFloat(data.Volume),
        };
    },

    refreshLiveData: function () {
        return new Promise((resolve, reject) => {
            // prevent overloading
            if (refreshLiveData.loading) {
                return reject('Already Loading');
            }

            refreshLiveData.loading = true;

            // get symbols from data
            try {
                let getKeys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(getKeys, (err, stores) => {
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

                    // Parse saved WatchList array to JSON object.
                    let watchListSymbolsCsv = '';

                    // populate array of symbols to load from yahoo
                    for (let i = 0; i < watchListStorage.data.length; i++) {
                        if (i === 0) {
                            watchListSymbolsCsv = watchListStorage.data[i].symbol
                        }
                        else {
                            watchListSymbolsCsv = watchListSymbolsCsv + ',' + watchListStorage.data[i].symbol
                        }
                    }

                    if (watchListSymbolsCsv !== '') {
                        // on load - this endpoint loads either Recent Activity or Profile List for user
                        let requestURL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + watchListSymbolsCsv + '%22)%0A%09%09&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

                        Request
                            .get(requestURL)
                            .timeout(ApiConstants.TIMEOUT)
                            .end((err, res) => {
                                if (err) {
                                    AppStorageActions.emitter.emit('setError', 'Error Connecting to Yahoo Finance');

                                    refreshLiveData.loading = false;

                                    return reject('Error Connecting to Yahoo Finance');
                                }
                                else if (res) {
                                    let data = res.body.query.results.quote;

                                    if (Array.isArray(data)) {

                                    }
                                    else {
                                        data = [res.body.query.results.quote];
                                    }

                                    refreshLiveData.loading = false;

                                    this.updateLiveDataObject(data)
                                        .then(() => {
                                            return resolve();
                                        })
                                        .catch(() => {
                                            return reject('Error Updating Object');
                                        });
                                }
                                else {
                                    AppStorageActions.emitter.emit('setError', 'Error Connecting to Yahoo Finance');

                                    refreshLiveData.loading = false;

                                    return reject('Error Connecting to Yahoo Finance');
                                }
                            });
                    }
                    // no stocks have been added to watch list
                    else {
                        return resolve();
                    }
                });
            } catch (error) {
                return reject('Error Fetching Data from Local Storage');
            }
        });
    },

    updateLiveDataObject: function (data) {
        return new Promise((resolve, reject) => {
            try {
                let getKeys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(getKeys, (err, stores) => {
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

                    let updatedWatchListData = watchListStorage.data.slice(0);

                    for (let j = 0; j < data.length; j++) {
                        let obj = data[j];

                        // only updated passed parameters. Do not need to include whole object, just new data
                        for (let i = 0; i < updatedWatchListData.length; i++) {
                            let storageObj = watchListStorage.data[i];

                            if (obj.symbol === storageObj.symbol) {
                                // update live data for symbol
                                if (storageObj.liveData) {
                                    if (obj.PercentChange &&
                                        obj.DaysLow &&
                                        obj.DaysHigh &&
                                        obj.LastTradeDate &&
                                        obj.LastTradePriceOnly &&
                                        obj.Open &&
                                        obj.PreviousClose &&
                                        obj.Volume
                                    ) {
                                        updatedWatchListData[i].liveData = this.setLiveData(obj);
                                    }
                                    else {
                                        return reject('Error updating symbols due to missing data');
                                    }
                                }
                            }
                        }
                    }

                    let nextState = {
                        data: updatedWatchListData
                    };

                    let setKeys = [];

                    for (let setKey in nextState) {
                        // skip loop if the property is from prototype
                        if (!nextState.hasOwnProperty(setKey)) continue;

                        switch (setKey) {
                            case 'data':
                                setKeys.push([
                                    AsyncStorageKeys.WatchListData, JSON.stringify(nextState[setKey])
                                ]);
                                break;
                        }
                    }

                    if (setKeys.length > 0) {
                        AsyncStorage.multiSet(setKeys, (err) => {
                            this.emitter.emit('watchListLoadDate', Date.now());

                            return resolve();
                        });
                    }
                });
            } catch (error) {
                return reject('Error Fetching Data from Local Storage');
            }
        });
    },

    insertData: function (data) {
        return new Promise((resolve, reject) => {
            try {
                let getKeys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(getKeys, (err, stores) => {
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

                    // data has not loaded so do not insert new data
                    let updatedWatchListData = [];

                    if (data.Symbol) {
                        if (watchListStorage.data) {
                            // check to see if stock was already added to list before inserting
                            for (let i = 0; i < watchListStorage.data.length; i++) {
                                let obj = watchListStorage.data[i];

                                if (obj.symbol === data.Symbol) {
                                    AppStorageActions.emitter.emit('setNotification', 'This Symbol Has Already Been Added');

                                    return resolve();
                                }
                            }

                            if (data.PercentChange &&
                                data.DaysLow &&
                                data.DaysHigh &&
                                data.LastTradeDate &&
                                data.LastTradePriceOnly &&
                                data.Open &&
                                data.PreviousClose &&
                                data.Volume
                            ) {
                                // set from data structure defined at the top of this file
                                let newData = {
                                    symbol: data.Symbol,
                                    liveData: this.setLiveData(data),
                                    userData: {
                                        buyInDate: null,
                                        buyInTime: null,
                                        buyInPrice: null,
                                        notes: null,
                                        sector: null,
                                        shares: null,
                                    },
                                };

                                updatedWatchListData = [newData].concat(watchListStorage.data);
                            }
                            else {
                                return reject('Invalid Stock Symbol');
                            }
                        }
                    }
                    else {
                        return reject('Invalid Stock Symbol');
                    }

                    let nextState = {
                        data: updatedWatchListData
                    };

                    let setKeys = [];

                    for (let setKey in nextState) {
                        // skip loop if the property is from prototype
                        if (!nextState.hasOwnProperty(setKey)) continue;

                        switch (setKey) {
                            case 'data':
                                setKeys.push([
                                    AsyncStorageKeys.WatchListData, JSON.stringify(nextState[setKey])
                                ]);
                                break;
                        }
                    }

                    if (setKeys.length > 0) {
                        AsyncStorage.multiSet(setKeys, (err) => {
                            return resolve();
                        });
                    }

                });
            } catch (error) {
                return reject();
            }
        });
    },

    updateDataObject: function (data) {
        return new Promise((resolve, reject) => {
            try {
                let getKeys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(getKeys, (err, stores) => {
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

                    let objToUpdate = [data.symbol],
                        updatedWatchListData = watchListStorage.data.slice(0);

                    // only updated passed parameters. Do not need to include whole object, just new data
                    for (let i = 0; i < updatedWatchListData.length; i++) {
                        if (objToUpdate.indexOf(updatedWatchListData[i].symbol) !== -1) {
                            // set the user data
                            if (data.userData) {
                                updatedWatchListData[i].userData = data.userData;
                            }
                        }
                    }

                    let nextState = {
                        data: updatedWatchListData
                    };

                    let setKeys = [];

                    for (let setKey in nextState) {
                        // skip loop if the property is from prototype
                        if (!nextState.hasOwnProperty(setKey)) continue;

                        switch (setKey) {
                            case 'data':
                                setKeys.push([
                                    AsyncStorageKeys.WatchListData, JSON.stringify(nextState[setKey])
                                ]);
                                break;
                        }
                    }

                    if (setKeys.length > 0) {
                        AsyncStorage.multiSet(setKeys, (err) => {
                            this.emitter.emit('watchListLoadDate', Date.now());

                            return resolve();
                        });
                    }
                    else {
                        return resolve();
                    }
                });
            } catch (error) {
                return reject();
            }
        });
    },

    removeFromData: function (data) {
        return new Promise((resolve, reject) => {
            try {
                let getKeys = [
                    AsyncStorageKeys.WatchListData,
                ];

                AsyncStorage.multiGet(getKeys, (err, stores) => {
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

                    let i,
                        objToDelete = [data.symbol],
                        updatedWatchListData = watchListStorage.data.slice(0);

                    for (i = 0; i < updatedWatchListData.length; i++) {
                        if (objToDelete.indexOf(updatedWatchListData[i].symbol) !== -1) {
                            // remove goal from data
                            updatedWatchListData.splice(i, 1);

                            i--;
                        }
                    }

                    let nextState = {
                        data: updatedWatchListData
                    };

                    let setKeys = [];

                    for (let setKey in nextState) {
                        // skip loop if the property is from prototype
                        if (!nextState.hasOwnProperty(setKey)) continue;

                        switch (setKey) {
                            case 'data':
                                setKeys.push([
                                    AsyncStorageKeys.WatchListData, JSON.stringify(nextState[setKey])
                                ]);
                                break;
                        }
                    }

                    if (setKeys.length > 0) {
                        AsyncStorage.multiSet(setKeys, (err) => {
                            return resolve();
                        });
                    }
                });
            } catch (error) {
                return reject('Error Deleting Data');
            }
        });
    },
};