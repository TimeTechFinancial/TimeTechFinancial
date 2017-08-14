import React, {Component} from 'react';
import {
    AppRegistry,
} from 'react-native';
import AppView from 'AppView';

export default class TimeTechFinancial extends Component {
    render() {
        return (
            <AppView/>
        );
    }
}

AppRegistry.registerComponent('TimeTechFinancial', () => TimeTechFinancial);
