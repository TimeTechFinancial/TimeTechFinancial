/**
 * @providesModule AppView
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    Animated,
    BackHandler,
    DatePickerIOS,
    LayoutAnimation,
    Picker,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import Dimensions from 'Dimensions';
import AppLoadingView from 'AppLoadingView';
import AppNavigator from 'AppNavigator';

const AppStorageActions = require('AppStorageActions');

const WIDTH = Dimensions.get('window').width;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000'
    },

    logInNotificationContainer: {
        position: 'absolute',
        top: 0, right: 0,
        bottom: 0, left: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logInNotificationContentContainer: {
        width: WIDTH - (28 * 2),
        backgroundColor: '#FAFAFA',
        borderRadius: 5,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    logInNotificationContentImageContainer: {
        width: WIDTH - (28 * 2), height: (WIDTH - (28 * 2)) * 9 / 16,
        backgroundColor: '#000000',
    },
    contentImage: {
        width: WIDTH - (28 * 2), height: (WIDTH - (28 * 2)) * 9 / 16,
        backgroundColor: '#757575',
        opacity: 0.7,
    },
    logInNotificationTitleTextContainer: {
        position: 'absolute',
        top: ((WIDTH - (28 * 2)) * 9 / 16) - 44,
        right: 16, left: 16,
        backgroundColor: 'transparent',
    },
    logInNotificationTitleText: {
        fontSize: 24,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 2,
        opacity: 1,
        textAlign: 'left',
    },
    logInNotificationDescriptionTextContainer: {
        paddingTop: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        paddingRight: 16,
        paddingLeft: 16,
    },
    logInNotificationDescriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#000000',
        opacity: 0.87,
        textAlign: 'left',
    },
    logInNotificationButtonContainer: {
        paddingTop: 7,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    logInNotificationButtonLogInText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E88E5',
        opacity: 1,
        textAlign: 'center',
        paddingTop: 14,
        paddingRight: 12,
        paddingBottom: 16,
        paddingLeft: 16,
    },
    logInNotificationButtonSignUpText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E88E5',
        opacity: 1,
        textAlign: 'center',
        paddingTop: 14,
        paddingRight: 12,
        paddingBottom: 16,
        paddingLeft: 12,
    },

    notificationContainer: {
        position: 'absolute',
        top: -(Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        right: 0, left: 0,
        paddingTop: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E88E5'
    },
    notificationStatusBarBackground: {
        height: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        position: 'absolute',
        top: 0,
        right: 0, left: 0,
        backgroundColor: '#1E88E5'
    },
    notificationText: {
        flex: 1,
        color: '#FFFFFF',
        opacity: 1,
        padding: 16,
        fontSize: 13,
        lineHeight: 16
    },
    errorContainer: {
        position: 'absolute',
        top: -(Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        right: 0, left: 0,
        paddingTop: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#757575'
    },
    errorStatusBarBackground: {
        height: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
        position: 'absolute',
        top: 0,
        right: 0, left: 0,
        backgroundColor: '#616161'
    },
    errorText: {
        flex: 1,
        color: '#FFFFFF',
        opacity: 1,
        padding: 16,
        fontSize: 13,
        lineHeight: 16,
        textAlign: 'center'
    },

    actionSheetContainer: {
        position: 'absolute',
        top: 0, right: 0,
        bottom: 0, left: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    actionSheetButtonsContainer: {
        position: 'absolute',
        right: 0,
        bottom: 0, left: 0,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    actionSheetButtonsContentContainer: {
        width: WIDTH - 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },
    actionSheetTitle: {
        padding: 18,
        backgroundColor: 'transparent',
    },
    actionSheetTitleText: {
        backgroundColor: 'transparent',
        color: '#000000',
        opacity: 0.87,
        fontSize: 18,
        textAlign: 'center',
    },
    actionSheetMessage: {
        padding: 18,
        backgroundColor: 'transparent',
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },
    actionSheetMessageText: {
        backgroundColor: 'transparent',
        color: '#000000',
        opacity: 0.70,
        fontSize: 14,
        textAlign: 'center',
    },
    actionSheetDestructiveButtonText: {
        padding: 18,
        backgroundColor: 'transparent',
        color: '#E53935',
        opacity: 1,
        fontSize: 18,
        textAlign: 'center',
    },
    actionSheetButton: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(0,0,0,0.12)',
    },
    actionSheetButtonText: {
        padding: 18,
        backgroundColor: 'transparent',
        color: '#000000',
        opacity: 0.87,
        fontSize: 18,
        textAlign: 'center',
    },

    actionSheetCancelButtonContainer: {
        marginTop: 12,
        width: WIDTH - 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
    },
    actionSheetCancelButton: {
        backgroundColor: 'transparent',
    },
    actionSheetCancelButtonText: {
        padding: 18,
        backgroundColor: 'transparent',
        color: '#1E88E5',
        opacity: 1,
        fontSize: 18,
        textAlign: 'center',
    },

    pickerContainer: {
        position: 'absolute',
        top: 0, right: 0,
        bottom: 0, left: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    pickerItemsContainer: {
        height: 248,
        position: 'absolute',
        right: 0,
        bottom: 0, left: 0,
        backgroundColor: '#F5F5F5'
    },
    pickerItemsDoneContainer: {
        height: 48,
        position: 'absolute',
        top: 0, right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    pickerItemsDoneText: {
        marginRight: 14,
        marginLeft: 14,
        fontSize: 15,
        color: '#1E88E5',
        opacity: 1,
        textAlign: 'right',
        alignSelf: 'center',
    },
    pickerItemsContentContainer: {
        height: 200,
        position: 'absolute',
        right: 0,
        bottom: 0, left: 0,
        backgroundColor: '#FFFFFF'
    },
    picker: {
        width: WIDTH, height: 50,
    },

    datePicker: {
        width: WIDTH, height: 208,
        position: 'absolute',
        bottom: 0, left: 0,
    },

    statusBarBackgroundColor: {
        position: 'absolute',
        top: 0, right: 0,
        left: 0,
        backgroundColor: '#000000',
    },
});

export default class AppView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,

            appUpdateRequired: false,

            // set search type to goals by default
            searchTypeFunction: null,

            statusBarDisplayInit: true,
            statusBarDisplay: null, // true or false
            statusBarStyle: null, // options 'dark-content', 'light-content'

            navigation: null,

            notificationData: {},
            notificationTransform: new Animated.Value(-120),
            errorData: {},
            errorTransform: new Animated.Value(-120),

            actionSheetDisplay: false,
            actionSheetTitle: null,
            actionSheetMessage: null,
            actionSheetOptions: [],
            actionSheetDestructiveButtonIndex: null,
            actionSheetCancelButton: false,
            actionSheetCallback: () => {
            },

            pickerDisplay: false,
            pickerSelectedValue: null,
            pickerItems: [],
            pickerCallback: () => {
            },

            datePickerDisplay: false,
            datePickerSelectedValue: null,
            datePickerCallback: () => {
            },


            // emitter listeners
            setActionSheetListener: null,
            setPickerListener: null,
            setDatePickerListener: null,
            toggleStatusBarDisplayListener: null,
            toggleStatusBarStyleListener: null,
            setNavigationListener: null,
            setLogInNotificationListener: null,
            setNotificationListener: null,
            setErrorListener: null,
            setBackHandlerListener: null,
        };

        // bind to function since promise is set
        this._unsetActionSheetView = this._unsetActionSheetView.bind(this);
        this._unsetPickerView = this._unsetPickerView.bind(this);
        this._unsetDatePickerView = this._unsetDatePickerView.bind(this);
    }

    componentWillMount() {
        // emitter listeners
        this.state.setActionSheetListener = AppStorageActions.emitter.addListener('setActionSheet', (options, callback) => {
            this._setActionSheetView(options, callback);
        });
        this.state.setPickerListener = AppStorageActions.emitter.addListener('setPicker', (options, callback) => {
            this._setPickerView(options, callback);
        });
        this.state.setDatePickerListener = AppStorageActions.emitter.addListener('setDatePicker', (options, callback) => {
            this._setDatePickerView(options, callback);
        });
        this.state.toggleStatusBarDisplayListener = AppStorageActions.emitter.addListener('toggleStatusBarDisplay', (data) => {
            this._toggleStatusBarDisplay(data);
        });
        this.state.toggleStatusBarStyleListener = AppStorageActions.emitter.addListener('toggleStatusBarStyle', (data) => {
            this._toggleStatusBarStyle(data);
        });
        this.state.setNavigationListener = AppStorageActions.emitter.addListener('setTabNavigation', (navigation) => {
            this._setTabNavigation(navigation);
        });
        this.state.setNotificationListener = AppStorageActions.emitter.addListener('setNotification', (data) => {
            this._setNotification(data);
        });
        this.state.setErrorListener = AppStorageActions.emitter.addListener('setError', (data) => {
            this._setError(data);
        });

        let nextState = {
            loading: false,
        };

        this.setState(nextState);

        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.statusBarDisplay !== nextState.statusBarDisplay) {
            if (nextState.statusBarDisplay === true) {
                StatusBar.setHidden(false, 'none');
            }
            else {
                StatusBar.setHidden(true, 'none');
            }
        }

        if (this.state.statusBarStyle !== nextState.statusBarStyle) {
            StatusBar.setBarStyle(nextState.statusBarStyle, false);
        }
    }

    componentWillUnmount() {
        // remove emitter listeners
        if (this.state.setActionSheetListener) {
            this.state.setActionSheetListener.remove();
        }
        if (this.state.setPickerListener) {
            this.state.setPickerListener.remove();
        }
        if (this.state.setDatePickerListener) {
            this.state.setDatePickerListener.remove();
        }
        if (this.state.toggleStatusBarDisplayListener) {
            this.state.toggleStatusBarDisplayListener.remove();
        }
        if (this.state.toggleStatusBarStyleListener) {
            this.state.toggleStatusBarStyleListener.remove();
        }
        if (this.state.setNavigationListener) {
            this.state.setNavigationListener.remove();
        }
        if (this.state.setLogInNotificationListener) {
            this.state.setLogInNotificationListener.remove();
        }
        if (this.state.setNotificationListener) {
            this.state.setNotificationListener.remove();
        }
        if (this.state.setErrorListener) {
            this.state.setErrorListener.remove();
        }
        if (this.state.setBackHandlerListener) {
            this.state.setBackHandlerListener.remove();
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={styles.container}>
                    <StatusBar
                        hidden={true}
                        backgroundColor={'rgba(0,0,0,0.15)'}
                        translucent={true}
                        showHideTransition={'fade'}
                    />
                    <AppLoadingView/>
                </View>
            );
        }

        let errorTransform = {transform: [{translateY: this.state.errorTransform}]},
            notificationTransform = {transform: [{translateY: this.state.notificationTransform}]};

        let notificationText = '';

        // set notification
        if (this.state.notificationData) {
            if (this.state.notificationData.type === 'addContent') {

            }

            notificationText = this.state.notificationData.text;
        }

        let errorText = '';

        // set notification
        if (this.state.errorData) {
            errorText = this.state.errorData.text;
        }

        let actionSheetContainerView,
            actionSheetButtonsContainerView =
                <TouchableWithoutFeedback onPress={this._unsetActionSheetView}>
                    <View style={[styles.actionSheetButtonsContainer, {bottom: -120}]}/>
                </TouchableWithoutFeedback>
        ;

        if (this.state.actionSheetDisplay) {
            actionSheetContainerView =
                <TouchableWithoutFeedback onPress={this._unsetActionSheetView}>
                    <View style={styles.actionSheetContainer}/>
                </TouchableWithoutFeedback>
            ;

            let actionSheetTitleView;
            // set title if one exists
            if (this.state.actionSheetTitle) {
                let actionSheetTitleBottomWidth = {borderBottomWidth: 1};

                if (this.state.actionSheetMessage) {
                    actionSheetTitleBottomWidth = {
                        paddingBottom: 0,
                        borderBottomWidth: 0,
                    };
                }
                actionSheetTitleView =
                    <TouchableWithoutFeedback>
                        <View style={[styles.actionSheetTitle, actionSheetTitleBottomWidth]}>
                            <Text style={[styles.actionSheetTitleText]}>{this.state.actionSheetTitle}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                ;
            }

            let actionSheetMessageView;
            // set message if one exists
            if (this.state.actionSheetMessage) {
                actionSheetMessageView =
                    <TouchableWithoutFeedback>
                        <View style={styles.actionSheetMessage}>
                            <Text style={[styles.actionSheetMessageText]}>{this.state.actionSheetMessage}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                ;
            }

            let actionSheetButtons;
            if (this.state.actionSheetOptions.length > 0) {
                actionSheetButtons = this.state.actionSheetOptions.map((optionTitle, rowIndex) => {
                    let actionSheetButtonBottomWidth = {borderBottomWidth: 1};

                    if (this.state.actionSheetOptions.length === rowIndex + 1) {
                        actionSheetButtonBottomWidth = {borderBottomWidth: 0};
                    }

                    if (this.state.actionSheetDestructiveButtonIndex === rowIndex) {
                        return (
                            <TouchableOpacity
                                key={rowIndex}
                                onPress={() => {
                                    this._unsetActionSheetView().then(() => {
                                        this.state.actionSheetCallback(rowIndex);
                                    }).catch(() => {
                                        this.state.actionSheetCallback(rowIndex);
                                    });
                                }}
                                activeOpacity={0.5}
                            >
                                <View style={[styles.actionSheetButton, actionSheetButtonBottomWidth]}>
                                    <Text style={[styles.actionSheetDestructiveButtonText]}>{optionTitle}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                    else {
                        return (
                            <TouchableOpacity
                                key={rowIndex}
                                onPress={() => {
                                    this._unsetActionSheetView().then(() => {
                                        this.state.actionSheetCallback(rowIndex);
                                    }).catch(() => {
                                        this.state.actionSheetCallback(rowIndex);
                                    });
                                }}
                                activeOpacity={0.5}
                            >
                                <View style={[styles.actionSheetButton, actionSheetButtonBottomWidth]}>
                                    <Text style={[styles.actionSheetButtonText]}>{optionTitle}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                });
            }

            let actionSheetCancelButton;
            if (this.state.actionSheetCancelButton) {
                actionSheetCancelButton =
                    <TouchableOpacity
                        onPress={this._unsetActionSheetView}
                        activeOpacity={0.5}
                    >
                        <View style={[styles.actionSheetCancelButton]}>
                            <Text style={[styles.actionSheetCancelButtonText]}>{'Cancel'}</Text>
                        </View>
                    </TouchableOpacity>
                ;
            }

            actionSheetButtonsContainerView =
                <TouchableWithoutFeedback onPress={this._unsetActionSheetView}>
                    <View style={styles.actionSheetButtonsContainer}>
                        <View style={styles.actionSheetButtonsContentContainer}>
                            {actionSheetTitleView}
                            {actionSheetMessageView}
                            {actionSheetButtons}
                        </View>
                        <View style={[styles.actionSheetCancelButtonContainer]}>
                            {actionSheetCancelButton}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ;
        }

        let pickerContainerView,
            pickerItemsContainerView =
                <TouchableWithoutFeedback onPress={this._unsetPickerView}>
                    <View style={[styles.pickerItemsContainer, {bottom: -248}]}/>
                </TouchableWithoutFeedback>
        ;

        if (this.state.pickerDisplay) {
            pickerContainerView =
                <TouchableWithoutFeedback onPress={this._unsetPickerView}>
                    <View style={styles.pickerContainer}/>
                </TouchableWithoutFeedback>
            ;

            let pickerItems;
            if (this.state.pickerItems.length > 0) {
                pickerItems = this.state.pickerItems.map((item, rowIndex) => {
                    return (
                        <Picker.Item key={rowIndex} label={item.label} value={item.value}/>
                    );
                });
            }

            pickerItemsContainerView =
                <TouchableWithoutFeedback>
                    <View style={styles.pickerItemsContainer}>
                        <TouchableOpacity activeOpacity={0.5} onPress={this._unsetPickerView}>
                            <View style={styles.pickerItemsDoneContainer}>
                                <Text style={styles.pickerItemsDoneText}>{"Done"}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.pickerItemsContentContainer}>
                            <Picker
                                style={styles.picker}
                                selectedValue={this.state.pickerSelectedValue}
                                onValueChange={(value) => {
                                    this.setState({
                                        pickerSelectedValue: value
                                    });

                                    if (this.state.pickerCallback) {
                                        this.state.pickerCallback(value);
                                    }
                                }}
                            >
                                {pickerItems}
                            </Picker>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ;
        }

        let datePickerContainerView,
            datePickerItemsContainerView =
                <TouchableWithoutFeedback onPress={this._unsetDatePickerView}>
                    <View style={[styles.pickerItemsContainer, {bottom: -248}]}/>
                </TouchableWithoutFeedback>
        ;

        if (this.state.datePickerDisplay) {
            datePickerContainerView =
                <TouchableWithoutFeedback onPress={this._unsetDatePickerView}>
                    <View style={styles.pickerContainer}/>
                </TouchableWithoutFeedback>
            ;

            datePickerItemsContainerView =
                <TouchableWithoutFeedback>
                    <View style={styles.pickerItemsContainer}>
                        <TouchableOpacity activeOpacity={0.5} onPress={this._unsetDatePickerView}>
                            <View style={styles.pickerItemsDoneContainer}>
                                <Text style={styles.pickerItemsDoneText}>{"Done"}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.pickerItemsContentContainer}>
                            <DatePickerIOS
                                style={styles.datePicker}
                                date={this.state.datePickerSelectedValue}
                                mode={"date"}
                                onDateChange={(value) => {
                                    this.setState({
                                        datePickerSelectedValue: value
                                    });

                                    if (this.state.datePickerCallback) {
                                        this.state.datePickerCallback(value);
                                    }
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ;
        }

        // have black status bar if android 19
        let statusBarBackgroundColor;
        if (Platform.OS === 'android' && Platform.Version <= 19 && this.state.statusBarDisplay) {
            statusBarBackgroundColor =
                <View
                    style={[styles.statusBarBackgroundColor, {height: StatusBar.currentHeight}]}
                />
            ;
        }

        return (
            <View style={styles.container}>
                <StatusBar
                    hidden={(this.state.statusBarDisplayInit !== true)}
                    backgroundColor={'rgba(0,0,0,0.15)'}
                    translucent={true}
                    showHideTransition={'fade'}
                />
                <AppNavigator/>
                <TouchableWithoutFeedback onPress={this._hideError.bind(this)}>
                    <Animated.View style={[styles.errorContainer, errorTransform]}>
                        <Text style={styles.errorText} allowFontScaling={false}>
                            {errorText}
                        </Text>
                        <View style={styles.errorStatusBarBackground}/>
                    </Animated.View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={this._hideNotification.bind(this)}>
                    <Animated.View style={[styles.notificationContainer, notificationTransform]}>
                        <Text style={styles.notificationText} allowFontScaling={false}>
                            {notificationText}
                        </Text>
                        <View style={styles.notificationStatusBarBackground}/>
                    </Animated.View>
                </TouchableWithoutFeedback>
                {actionSheetContainerView}
                {actionSheetButtonsContainerView}
                {pickerContainerView}
                {pickerItemsContainerView}
                {datePickerContainerView}
                {datePickerItemsContainerView}
                {statusBarBackgroundColor}
            </View>
        );
    }

    _setAppUpdateRequired() {
        LayoutAnimation.easeInEaseOut();

        this.setState({
            appUpdateRequired: true,
        });
    }

    _setActionSheetView(options, callback) {
        if (Platform.OS === 'android' && this.state.setBackHandlerListener === null) {
            this.state.setBackHandlerListener = BackHandler.addEventListener('hardwareBackPress', () => {
                if (this.state && this.state.actionSheetDisplay) {
                    this._unsetActionSheetView();
                    return true;
                }

                return false;
            });
        }

        let nextState = {
            actionSheetDisplay: true,
        };

        if (options.title !== null) {
            nextState.actionSheetTitle = options.title;
        }

        if (options.message !== null) {
            nextState.actionSheetMessage = options.message;
        }

        if (options.options !== null) {
            nextState.actionSheetOptions = options.options;
        }

        if (options.destructiveButtonIndex !== null) {
            nextState.actionSheetDestructiveButtonIndex = options.destructiveButtonIndex;
        }

        if (options.cancelButton !== null) {
            nextState.actionSheetCancelButton = true;
        }

        if (callback !== null) {
            nextState.actionSheetCallback = callback;

        }

        LayoutAnimation.easeInEaseOut();

        this.setState(nextState);
    }

    _unsetActionSheetView() {
        return new Promise((resolve, reject) => {
            LayoutAnimation.easeInEaseOut();

            this.setState({
                actionSheetDisplay: false,
                actionSheetTitle: null,
                actionSheetMessage: null,
                actionSheetOptions: [],
                actionSheetDestructiveButtonIndex: null,
                actionSheetCancelButton: false,
            });

            return resolve();
        });
    }

    _setPickerView(options, callback) {
        if (Platform.OS === 'android' && this.state.setBackHandlerListener === null) {
            this.state.setBackHandlerListener = BackHandler.addEventListener('hardwareBackPress', () => {
                if (this.state && this.state.pickerDisplay) {
                    this._unsetPickerView();
                    return true;
                }

                return false;
            });
        }

        let nextState = {
            pickerDisplay: true,
        };

        if (options.selectedValue) {
            nextState.pickerSelectedValue = options.selectedValue;
        }

        if (options.items !== null) {
            nextState.pickerItems = options.items;
        }

        if (callback !== null) {
            nextState.pickerCallback = callback;
        }

        LayoutAnimation.easeInEaseOut();

        this.setState(nextState);
    }

    _unsetPickerView() {
        return new Promise((resolve, reject) => {
            LayoutAnimation.easeInEaseOut();

            this.setState({
                pickerDisplay: false,
                pickerSelectedValue: null,
                pickerItems: [],
            });

            return resolve();
        });
    }

    _setDatePickerView(options, callback) {
        if (Platform.OS === 'android' && this.state.setBackHandlerListener === null) {
            this.state.setBackHandlerListener = BackHandler.addEventListener('hardwareBackPress', () => {
                if (this.state && this.state.pickerDisplay) {
                    this._unsetDatePickerView();
                    return true;
                }

                return false;
            });
        }

        let nextState = {
            datePickerDisplay: true,
        };

        if (options.selectedValue) {
            nextState.datePickerSelectedValue = options.selectedValue;
        }

        if (callback !== null) {
            nextState.datePickerCallback = callback;
        }

        LayoutAnimation.easeInEaseOut();

        this.setState(nextState);
    }

    _unsetDatePickerView() {
        return new Promise((resolve, reject) => {
            LayoutAnimation.easeInEaseOut();

            this.setState({
                datePickerDisplay: false,
                datePickerSelectedValue: null,
            });

            return resolve();
        });
    }

    _toggleStatusBarDisplay(data) {
        this.setState({
            statusBarDisplay: data
        });
    }

    _toggleStatusBarStyle(data) {
        this.setState({
            statusBarStyle: data
        });
    }

    _setTabNavigation(navigation) {
        this.state.tabNavigation = navigation;
    }

    _setNotification(data) {
        let notificationType = 'default',
            notificationText = '';

        if (typeof data === 'string') {
            notificationText = data;
        }
        else {
            notificationType = data.type;
            notificationText = data.text;
        }

        this.setState({
            notificationData: {
                type: notificationType,
                text: notificationText
            }
        });

        this._displayNotification();
    }

    _setError(err) {
        let errorText = '';

        if (typeof err === 'string') {
            errorText = err;
        }
        else {
            if (err.timeout) {
                errorText = 'No Server Connection';
            }
            else if (err.status >= 300 && err.status <= 399) {
                // notify user to update the app
                if (err.status === 301) {
                    // set all states to null, clear all storage data, and display view to notify user to update the app
                    this._setAppUpdateRequired();
                }

                if (err.response.body !== null) {
                    errorText = err.response.body.error;
                }
                else {
                    errorText = 'This version of the API is no longer supported.';
                }
            }
            else if (err.status >= 400 && err.status <= 499) {
                if (err.status === 403) {
                    if (this.state.user === null && this.state.auth && this.state.auth.userId === null) {
                        // reset public access token
                        AuthStorageActions.setPublicAuth().then(() => {
                            AuthStorageActions.emitter.emit('authLoadDate', Date.now());
                        });
                    }
                    else {
                        // unsetUser if session has expired
                        AuthStorageActions.setPublicAuth().then(() => {
                            UserStorageActions.setUser({
                                user: null
                            }).then(() => {
                                AuthStorageActions.emitter.emit('authLoadDate', Date.now());
                            });
                        });
                    }
                }

                if (err.response.body !== null) {
                    errorText = err.response.body.error;
                }
                else {
                    errorText = 'The API is currently unavailable.';
                }
            }
            else if (err.status >= 500 && err.status <= 599) {
                if (err.status === 503) {
                    errorText = 'Our servers are experiencing issues.\nPlease come back later.';
                }
                else {
                    errorText = 'The API is currently unavailable.';
                }
            }
            else {
                errorText = 'No Internet Connection';
            }
        }

        this.setState({
            errorData: {
                text: errorText
            }
        });

        this._displayError();
    }

    _displayNotification() {
        let statusBarHeight = 0;

        if (this.state.statusBarDisplay) {
            statusBarHeight = (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight);

            if (this.state.statusBarStyle === 'dark-content') {
                StatusBar.setBarStyle('light-content', false);
            }
        }

        Animated.timing(this.state.notificationTransform, {
            toValue: statusBarHeight,
            duration: 500
        }).start();

        setTimeout(() => {
            Animated.timing(this.state.notificationTransform, {
                toValue: -120,
                duration: 500
            }).start();

            if (this.state.statusBarDisplay) {
                if (this.state.statusBarStyle === 'dark-content') {
                    StatusBar.setBarStyle('dark-content', false);
                }
            }
        }, 3000);
    }

    _hideNotification() {
        Animated.timing(this.state.notificationTransform, {
            toValue: -120,
            duration: 500
        }).start();

        if (this.state.statusBarDisplay) {
            if (this.state.statusBarStyle === 'dark-content') {
                StatusBar.setBarStyle('dark-content', false);
            }
        }
    }

    _displayError() {
        let statusBarHeight = 0;

        if (this.state.statusBarDisplay) {
            statusBarHeight = (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight);

            if (this.state.statusBarStyle === 'dark-content') {
                StatusBar.setBarStyle('light-content', false);
            }
        }

        Animated.timing(this.state.errorTransform, {
            toValue: statusBarHeight,
            duration: 500
        }).start();

        setTimeout(() => {
            Animated.timing(this.state.errorTransform, {
                toValue: -120,
                duration: 500
            }).start();

            if (this.state.statusBarDisplay) {
                if (this.state.statusBarStyle === 'dark-content') {
                    StatusBar.setBarStyle('dark-content', false);
                }
            }
        }, 3000);
    }

    _hideError() {
        Animated.timing(this.state.errorTransform, {
            toValue: -120,
            duration: 500
        }).start();

        if (this.state.statusBarDisplay) {
            if (this.state.statusBarStyle === 'dark-content') {
                StatusBar.setBarStyle('dark-content', false);
            }
        }
    }
}