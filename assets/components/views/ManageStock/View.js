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

    liveDataContainer: {
        flex: 1,
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

    dateContainer: {
        flex: 1, height: 48,
        padding: 14,
        paddingBottom: 0,
    },
    dateContentContainer: {
        flex: 1,
        paddingBottom: 14,
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },
    dateTextContainer: {
        position: 'absolute',
        top: 0, left: 0,
    },
    dateTitleText: {
        lineHeight: 20,
        fontSize: 16,
        color: '#000000',
        opacity: 0.87,
    },
    dateFormattedTextContainer: {
        position: 'absolute',
        top: 0, right: 0,
    },
    dateFormattedText: {
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

            buyInDate: null,
            buyInDateOriginal: null,
            buyInDateFormatted: null,
            buyInDatePickerValue: new Date(),

            buyInTime: null,
            buyInTimeOriginal: null,
            buyInTimeFormatted: null,
            buyInTimePickerValue: new Date(),

            buyInPrice: '',
            buyInPriceOriginal: '',

            notes: '',
            notesOriginal: '',

            sector: '',
            sectorOriginal: '',

            shares: '',
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
            this.state.buyInTime !== nextState.buyInTime ||
            this.state.buyInPrice !== nextState.buyInPrice ||
            this.state.notes !== nextState.notes ||
            this.state.sector !== nextState.sector ||
            this.state.shares !== nextState.shares
        ) {
            if (nextState.buyInDate !== nextState.buyInDateOriginal ||
                nextState.buyInTime !== nextState.buyInTimeOriginal ||
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
                nextState.buyInTime === nextState.buyInTimeOriginal &&
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
        let buyInDateFormatted =
            <View style={styles.dateFormattedTextContainer}>
                <Text style={styles.dateFormattedText}>
                    {'Set Your Buy In Date'}
                </Text>
            </View>
        ;
        if (this.state.buyInDateFormatted) {
            buyInDateFormatted =
                <View style={styles.dateFormattedTextContainer}>
                    <Text style={styles.dateFormattedText}>
                        {this.state.buyInDateFormatted}
                    </Text>
                </View>
            ;
        }

        let buyInTimeFormatted =
            <View style={styles.dateFormattedTextContainer}>
                <Text style={styles.dateFormattedText}>
                    {'Set Your Buy In Time'}
                </Text>
            </View>
        ;
        if (this.state.buyInTimeFormatted) {
            buyInTimeFormatted =
                <View style={styles.dateFormattedTextContainer}>
                    <Text style={styles.dateFormattedText}>
                        {this.state.buyInTimeFormatted}
                    </Text>
                </View>
            ;
        }

        let liveDataContainer,
            additionalLiveDataContainer;

        if (this.state.liveData) {
            let stockTextColor = {
                    color: '#4CAF50'
                },
                stockBackgroundColor = {
                    backgroundColor: '#4CAF50'
                };

            if (this.state.liveData.Change < 0) {
                stockTextColor = {
                    color: '#F44336'
                };
                stockBackgroundColor = {
                    backgroundColor: '#F44336'
                };
            }

            let totalStockInvestmentView,
                investmentProfitsView;
            if (this.state.buyInPrice && parseFloat(this.state.buyInPrice) !== 0 && this.state.shares) {

                let currentPrice = parseFloat(this.state.liveData.lastTradePriceOnly),
                    buyInPrice = parseFloat(this.state.buyInPrice),
                    shares = parseFloat(this.state.shares);

                let totalStockInvestment = '$' + (shares * buyInPrice);

                totalStockInvestmentView =
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Investment'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {totalStockInvestment}
                                </Text>
                            </View>
                        </View>
                    </View>
                ;

                let investmentProfits = Math.round((shares * (currentPrice - buyInPrice)) * 100) / 100,
                    investmentProfitsChange = (Math.round((((currentPrice - buyInPrice) / buyInPrice) * 100) * 100) / 100) + '%';

                let investmentProfitsTextColor = {
                        color: '#4CAF50'
                    },
                    investmentProfitsBackgroundColor = {
                        backgroundColor: '#4CAF50'
                    };

                if (investmentProfits < 0) {
                    investmentProfitsTextColor = {
                        color: '#F44336'
                    };
                    investmentProfitsBackgroundColor = {
                        backgroundColor: '#F44336'
                    };
                }

                investmentProfitsView =
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Profits'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueBoldContainer}>
                                <Text style={[styles.investmentValueBoldText, investmentProfitsTextColor]}>
                                    {investmentProfits}
                                </Text>
                            </View>
                            <View style={[styles.changeContainer, investmentProfitsBackgroundColor]}>
                                <Text style={[styles.changeText]}>
                                    {investmentProfitsChange}
                                </Text>
                            </View>
                        </View>
                    </View>
                ;
            }

            liveDataContainer =
                <View style={styles.liveDataContainer}>
                    <View style={styles.stockContainer}>
                        <View style={styles.symbolContainer}>
                            <Text style={styles.symbolText}>
                                {this.state.symbol}
                            </Text>
                        </View>
                        <View style={styles.stockPriceInfoContainer}>
                            <View style={styles.currentPriceContainer}>
                                <Text style={[styles.currentPriceText, stockTextColor]}>
                                    {this.state.liveData.lastTradePriceOnly}
                                </Text>
                            </View>
                            <View style={[styles.changeContainer, stockBackgroundColor]}>
                                <Text style={[styles.changeText]}>
                                    {this.state.liveData.change}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {totalStockInvestmentView}
                    {investmentProfitsView}
                </View>
            ;

            additionalLiveDataContainer =
                <View style={styles.liveDataContainer}>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Days Low'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.liveData.daysLow}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Days High'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.liveData.daysHigh}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Open'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.liveData.open}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Previous Close'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.liveData.previousClose}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.investmentContainer}>
                        <View style={styles.investmentTitleContainer}>
                            <Text style={styles.investmentTitleText}>
                                {'Volume'}
                            </Text>
                        </View>
                        <View style={styles.investmentValueInfoContainer}>
                            <View style={styles.investmentValueContainer}>
                                <Text style={[styles.investmentValueText]}>
                                    {this.state.liveData.volume}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            ;
        }


        return (
            <View
                style={styles.container}
            >
                <ScrollView
                    ref={(listView) => {
                        this.state.refListView = listView;
                    }}
                    scrollEventThrottle={8}
                    onScroll={this._onScroll.bind(this)}
                    removeClippedSubviews={false}
                >
                    {liveDataContainer}
                    <TouchableWithoutFeedback onPress={this._setBuyInDateDatePickerView.bind(this)}>
                        <View style={styles.dateContainer}>
                            <View style={styles.dateContentContainer}>
                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateTitleText}>
                                        {'Buy In Date'}
                                    </Text>
                                </View>
                                {buyInDateFormatted}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this._setBuyInTimeDatePickerView.bind(this)}>
                        <View style={styles.dateContainer}>
                            <View style={styles.dateContentContainer}>
                                <View style={styles.dateTextContainer}>
                                    <Text style={styles.dateTitleText}>
                                        {'Buy In Time'}
                                    </Text>
                                </View>
                                {buyInTimeFormatted}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
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
                        disableNonNumeric={true}
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
                        disableNonNumeric={true}
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
                    {additionalLiveDataContainer}
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


                                if (objUserData.buyInDate) {
                                    let buyInDateArray = objUserData.buyInDate.split(" "),
                                        buyInDatePickerValue = new Date(buyInDateArray[0]);

                                    // set date and compensate for timezone
                                    buyInDatePickerValue = new Date(buyInDatePickerValue.setTime(buyInDatePickerValue.getTime() + buyInDatePickerValue.getTimezoneOffset() * 60 * 1000));

                                    this._setBuyInDateOnLoad(buyInDatePickerValue);
                                }

                                if (objUserData.buyInTime) {
                                    let buyInTime = objUserData.buyInTime.split(':');

                                    let buyInTimePickerValue = new Date(); // creates a Date Object using the clients current time

                                    buyInTimePickerValue.setHours(+buyInTime[0]); // set Time accordingly, using implicit type coercion
                                    buyInTimePickerValue.setMinutes(buyInTime[1]); // you can pass Number or String, it doesn't matter
                                    buyInTimePickerValue.setSeconds(buyInTime[2]);

                                    this._setBuyInTimeOnLoad(buyInTimePickerValue);
                                }

                                this.setState({
                                    liveData: obj.liveData,

                                    buyInPrice: (objUserData.buyInPrice ? objUserData.buyInPrice + '' : ''),
                                    buyInPriceOriginal: (objUserData.buyInPrice ? objUserData.buyInPrice + '' : ''),

                                    notes: (objUserData.notes ? objUserData.notes + '' : ''),
                                    notesOriginal: (objUserData.notes ? objUserData.notes + '' : ''),

                                    sector: (objUserData.sector ? objUserData.sector + '' : ''),
                                    sectorOriginal: (objUserData.sector ? objUserData.sector + '' : ''),

                                    shares: (objUserData.shares ? objUserData.shares + '' : ''),
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

    _setBuyInDateOnLoad(buyInDatePickerValue) {
        let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let buyInDate = (buyInDatePickerValue.toISOString().substr(0, 19).split('T'))[0] + ' 00:00:00',
            buyInDateFormatted = monthNames[buyInDatePickerValue.getMonth()] + ' ' + buyInDatePickerValue.getDate() + ', ' + buyInDatePickerValue.getFullYear();

        this.setState({
            buyInDatePickerValue: buyInDatePickerValue,
            buyInDate: buyInDate,
            buyInDateOriginal: buyInDate,
            buyInDateFormatted: buyInDateFormatted,
        });
    }

    _setBuyInDateDatePickerView() {
        // set buyInDate if not set
        if (this.state.buyInDate === null || this.state.buyInDateFormatted === null) {
            this._setBuyInDate(new Date());
        }

        AppStorageActions
            .emitter.emit('setDatePicker', {
                selectedValue: this.state.buyInDatePickerValue,
            },
            (value) => {
                this._setBuyInDate(value);
            }
        );
    }

    _setBuyInDate(buyInDatePickerValue) {
        if (buyInDatePickerValue !== null) {
            let monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            let buyInDate = (buyInDatePickerValue.toISOString().substr(0, 19).split('T'))[0] + ' 00:00:00',
                buyInDateFormatted = monthNames[buyInDatePickerValue.getMonth()] + ' ' + buyInDatePickerValue.getDate() + ', ' + buyInDatePickerValue.getFullYear();

            this.setState({
                buyInDatePickerValue: buyInDatePickerValue,
                buyInDate: buyInDate,
                buyInDateFormatted: buyInDateFormatted,
            });
        }
        // clear value if null
        else {
            this.setState({
                buyInDatePickerValue: new Date(),
                buyInDate: null,
                buyInDateFormatted: null,
            });
        }
    }

    _setBuyInTimeOnLoad(buyInTimePickerValue) {
        let tzOffset = (buyInTimePickerValue).getTimezoneOffset() * 60000,
            buyInTime = ((new Date(buyInTimePickerValue - tzOffset).toISOString().substr(0, 19).split('T'))[1]).substr(0, 6) + '00',
            buyInTimeFormatted = buyInTimePickerValue.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");

        this.setState({
            buyInTimePickerValue: buyInTimePickerValue,
            buyInTime: buyInTime,
            buyInTimeOriginal: buyInTime,
            buyInTimeFormatted: buyInTimeFormatted,
        });
    }

    _setBuyInTimeDatePickerView() {
        // set buyInTime if not set
        if (this.state.buyInTime === null || this.state.buyInTimeFormatted === null) {
            this._setBuyInTime(new Date());
        }

        AppStorageActions
            .emitter.emit('setTimePicker', {
                selectedValue: this.state.buyInTimePickerValue,
            },
            (value) => {
                this._setBuyInTime(value);
            }
        );
    }

    _setBuyInTime(buyInTimePickerValue) {
        if (buyInTimePickerValue !== null) {

            let tzOffset = (buyInTimePickerValue).getTimezoneOffset() * 60000,
                buyInTime = ((new Date(buyInTimePickerValue - tzOffset).toISOString().substr(0, 19).split('T'))[1]).substr(0, 6) + '00',
                buyInTimeFormatted = buyInTimePickerValue.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");

            this.setState({
                buyInTimePickerValue: buyInTimePickerValue,
                buyInTime: buyInTime,
                buyInTimeFormatted: buyInTimeFormatted,
            });
        }
        // clear value if null
        else {
            this.setState({
                buyInTimePickerValue: new Date(),
                buyInTime: null,
                buyInTimeFormatted: null,
            });
        }
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

    _editStock() {
        let buttons = [
            'Remove Stock',
            'Cancel',
        ];
        let destructiveIndex = 0;
        let cancelIndex = 1;

        ActionSheetIOS.showActionSheetWithOptions({
                message: this.state.symbol,
                options: buttons,
                cancelButtonIndex: cancelIndex,
                destructiveButtonIndex: destructiveIndex,
            },
            (buttonIndex) => {
                // remove stock from watchList
                if (buttonIndex === 0) {
                    WatchListStorageActions.removeFromData({
                        symbol: this.state.symbol
                    })
                        .then(() => {
                            // successfully added new stock to watch list
                            WatchListStorageActions.emitter.emit('watchListLoadDate', Date.now());

                            this._closeView();
                        })
                        .catch((errorMessage) => {
                            // an error when trying to add stock symbol to local storage
                            AppStorageActions.emitter.emit('setError', errorMessage);
                        });
                }
            });
    }

    _setUpdateStockUserData() {
        let buyInDateFormatted = (this.state.buyInDate !== "" ? this.state.buyInDate : null),
            buyInTimeFormatted = (this.state.buyInTime !== "" ? this.state.buyInTime : null),
            buyInPriceFormatted = (this.state.buyInPrice !== "" ? parseFloat(this.state.buyInPrice.replace(/[^\d\.]/g, "")) : null),
            notesFormatted = (this.state.notes !== "" ? this.state.notes : null),
            sectorFormatted = (this.state.sector !== "" ? this.state.sector : null),
            sharesFormatted = (this.state.shares !== "" ? parseFloat(this.state.shares.replace(/[^\d\.]/g, "")) : null);

        WatchListStorageActions.updateDataObject({
            symbol: this.state.symbol,
            userData: {
                buyInDate: buyInDateFormatted,
                buyInTime: buyInTimeFormatted,
                buyInPrice: buyInPriceFormatted,
                notes: notesFormatted,
                sector: sectorFormatted,
                shares: sharesFormatted,
            }
        }).then(() => {
            this.props.navigation.setParams({
                rightButtonState: null,
            });

            this.setState({
                loading: false,
                rightButtonState: null,

                buyInDateOriginal: this.state.buyInDate,
                buyInTimeOriginal: this.state.buyInTime,
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

    _closeView() {
        if (this.state.closingView === false) {
            this.props.navigation.goBack();
        }
    }
}