/**
 * @providesModule AppNavigator
 *
 */

'use strict';

import React, {
    Component,
} from 'react';
import {
    LayoutAnimation,
    Platform,
    StatusBar,
} from 'react-native';
import {TabNavigator, TabBarBottom, StackNavigator} from 'react-navigation';
import dismissKeyboard from 'dismissKeyboard';

import HeaderBackButtonView from 'HeaderBackButtonView';
import HeaderSaveButtonView from 'HeaderSaveButtonView';
import HeaderLoadingButtonView from 'HeaderLoadingButtonView';

import OptionsListView from 'OptionsListView';
import WatchListView from 'WatchListView';
import TradesView from 'TradesView';

import ManageStockView from 'ManageStockView';

const AppStorageActions = require('AppStorageActions');

// use when a save button is needed for header
const headerSaveNavigationOptions = (navigation, title, options = {}) => {
    const {state} = navigation;

    let headerRightButton = null,
        rightButtonState = null
    ;

    if (state.params && state.params.rightButtonState) {
        if (state.params.rightButtonState === 'save' && state.params.rightButtonStateTimestamp) {
            LayoutAnimation.easeInEaseOut();

            headerRightButton =
                <HeaderSaveButtonView
                    navigation={navigation}
                    rightButtonStateTimestamp={state.params.rightButtonStateTimestamp}
                />
            ;
            rightButtonState = state.params.rightButtonState;
        }
        else if (state.params.rightButtonState === 'loading') {
            LayoutAnimation.easeInEaseOut();

            dismissKeyboard();

            headerRightButton =
                <HeaderLoadingButtonView
                    navigation={navigation}
                />
            ;
            rightButtonState = state.params.rightButtonState;
        }
    }

    options.title = title;
    options.headerTitle = title;
    options.headerBackTitle = null;
    options.headerRight = headerRightButton;
    options.headerLeft = (
        <HeaderBackButtonView
            navigation={navigation}
            rightButtonState={rightButtonState}
        />
    );

    return options;
};

const HomeNavigator = StackNavigator(
    {
        OptionsListView: {
            screen: OptionsListView,
            path: '/article/:articleId',
            navigationOptions: {
                title: 'Time Tech Financial',
                headerTitle: 'Time Tech Financial',
                headerBackTitle: null,
                headerLeft: null,
            },
        },
        WatchListView: {
            screen: WatchListView,
            navigationOptions: {
                title: 'Watch List',
                headerTitle: 'Watch List',
                headerBackTitle: null,
            },
        },
        TradesView: {
            screen: TradesView,
            navigationOptions: {
                title: 'Trades',
                headerTitle: 'Trades',
                headerBackTitle: null,
            },
        },
        ManageStockView: {
            screen: ManageStockView,
            navigationOptions: ({navigation}) => {
                return headerSaveNavigationOptions(navigation, 'Manage Stock');
            },
        },
    },
    {
        initialRouteName: 'OptionsListView',
        headerMode: 'screen',
        navigationOptions: ({navigation}) => {
            return {
                gesturesEnabled: false,
                headerStyle: {
                    height: 48 + (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
                    paddingTop: (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight),
                    elevation: 0,
                    backgroundColor: '#66ff8d',
                },
                headerTintColor: '#2e2e2e',
                headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: '400',
                },
                headerLeft: (
                    <HeaderBackButtonView
                        navigation={navigation}
                    />
                )
            };
        },
    });

const AppTabNavigator = TabNavigator(
    {
        HomeTab: {
            screen: HomeNavigator,
            path: '/',
            navigationOptions: {
                tabBarLabel: 'Home',
            },
        },
    },
    {
        swipeEnabled: false,
        animationEnabled: true,

        backBehavior: 'none',
        tabBarComponent: TabBarBottom,
        initialRouteName: 'HomeTab',
        tabBarPosition: 'bottom',
        tabBarOptions: {
            activeTintColor: '#2e2e2e',
            activeBackgroundColor: '#f2f2f2',
            inactiveTintColor: '#686868',
            inactiveBackgroundColor: '#e5e5e5',

            showIcon: true,
            showLabel: false,
            style: {
                height: 0,
                overflow: 'hidden',
                borderTopWidth: 0,
            },
        },
    }
);

const statusBarHideArray = [
    'EmptyView'
];
const statusBarLightStyleArray = [];

export default class AppNavigator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusBarDisplay: null,
            statusBarStyle: null,
        };
    }

    render() {
        return (
            <AppTabNavigator
                onNavigationStateChange={(prevState, currentState) => {
                    const currentScreen = this._getCurrentRouteName(currentState);
                    const prevScreen = this._getCurrentRouteName(prevState);

                    if (prevScreen !== currentScreen) {
                        // check to see if currentScreen should display StatusBar
                        if (statusBarHideArray.indexOf(currentScreen) > -1) {
                            if (this.state.statusBarDisplay !== false) {
                                this.state.statusBarDisplay = false;
                                AppStorageActions.emitter.emit('toggleStatusBarDisplay', false);
                            }
                        } else {
                            if (this.state.statusBarDisplay !== true) {
                                this.state.statusBarDisplay = true;
                                AppStorageActions.emitter.emit('toggleStatusBarDisplay', true);
                            }

                            // set style of status bar
                            if (statusBarLightStyleArray.indexOf(currentScreen) > -1) {
                                if (this.state.statusBarStyle !== 'light-content') {
                                    this.state.statusBarStyle = 'light-content';
                                    AppStorageActions.emitter.emit('toggleStatusBarStyle', 'light-content');
                                }
                            } else {
                                if (this.state.statusBarStyle !== 'dark-content') {
                                    this.state.statusBarStyle = 'dark-content';
                                    AppStorageActions.emitter.emit('toggleStatusBarStyle', 'dark-content');
                                }
                            }
                        }

                        dismissKeyboard();
                    }
                }}
            />
        );
    }

    // gets the current screen from navigation state
    _getCurrentRouteName(navigationState) {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this._getCurrentRouteName(route);
        }
        return route.routeName;
    }
}