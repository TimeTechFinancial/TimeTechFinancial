/**
 * @providesModule TextInputLabelView
 *
 */


'use strict';

import React, {
    Component,
} from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';

const styles = StyleSheet.create({
    container: {
        minHeight: 48,
        padding: 14,
        paddingBottom: 4,
    },
    textLabelContainer: {
        position: 'absolute',
        left: 14,
    },
    textLabel: {
        color: '#000000',
        opacity: 0.54,
    },
    textInput: {
        paddingTop: 12,
        paddingBottom: 7,
        marginVertical: 0,
        paddingVertical: 0,
        fontSize: 17,
        color: '#000000',
        opacity: 0.87,
        borderColor: 'rgba(0,0,0,0.12)',
        borderBottomWidth: 1,
    },

    submitButtonContainer: {
        height: 48,
        position: 'absolute',
        top: 2, right: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    icon30: {
        width: 30, height: 30,
    }
});

export default class TextInputLabelView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refTextInput: null,
            textLabelActive: false,
            textLabelActiveTransform: new Animated.Value(0),

            textInputHeight: 0,
            textInputFocused: false,
        };
    }

    componentWillMount() {
        if (this.props.value && this.props.value !== '') {
            this.state.textLabelActive = true;
            this.state.textLabelActiveTransform.setValue(1);
        }
    }

    componentWillReceiveProps(nextProps) {
        // format currency on load of data

        if (this.props.value !== nextProps.value) {
            if (this.state.textInputFocused === false) {
                if (nextProps.value && nextProps.value !== '') {
                    this.state.textLabelActive = true;
                    this.state.textLabelActiveTransform.setValue(1);
                }
                else {
                    this.state.textLabelActive = false;
                    this.state.textLabelActiveTransform.setValue(0);
                }
            }
        }
    }

    render() {

        let textLabelContainerTopInterpolate = this.state.textLabelActiveTransform.interpolate({
                inputRange: [0, 1],
                outputRange: [26, 7]
            }),
            textLabelContainerTop = {top: textLabelContainerTopInterpolate},
            textLabelFontSizeInterpolate = this.state.textLabelActiveTransform.interpolate({
                inputRange: [0, 1],
                outputRange: [17, 11]
            }),
            textLabelFontSize = {fontSize: textLabelFontSizeInterpolate}
        ;

        let textLabel =
            <Animated.View style={[styles.textLabelContainer, textLabelContainerTop]}>
                <Animated.Text style={[styles.textLabel, textLabelFontSize]}>
                    {this.props.textInputLabel}
                </Animated.Text>
            </Animated.View>
        ;

        let returnButton;

        if (this.props.submitButton) {
            let submitButtonOpacityInterpolate = this.state.textLabelActiveTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                }),
                submitButtonOpacity = {opacity: submitButtonOpacityInterpolate},
                submitButtonWidthInterpolate = this.state.textLabelActiveTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 48]
                }),
                submitButtonWidth = {width: submitButtonWidthInterpolate}
            ;

            returnButton =
                <TouchableWithoutFeedback onPress={this._onSubmitButtonPress.bind(this)}>
                    <Animated.View
                        onStartShouldSetResponder={(evt) => true}
                        onStartShouldSetResponderCapture={(evt) => true}
                        style={[styles.submitButtonContainer, submitButtonOpacity, submitButtonWidth]}
                    >
                        <Image
                            style={styles.icon30}
                            source={require('../../img/Plus/Plus30.png')}
                            resizeMode={'cover'}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>
            ;
        }

        return (
            <View>
                <TouchableWithoutFeedback onPress={this._onPress.bind(this)}>
                    <View
                        onStartShouldSetResponder={(evt) => true}
                        onStartShouldSetResponderCapture={(evt) => true}
                        style={[styles.container]}
                    >
                        {textLabel}
                        <TextInput
                            ref={(TextInput) => {
                                this.state.refTextInput = TextInput
                            }}
                            onFocus={() => {
                                this.state.textInputFocused = true;
                            }}
                            onBlur={() => {
                                this.state.textInputFocused = false;
                            }}
                            onLayout={this._onLayout.bind(this)}
                            style={styles.textInput}
                            maxLength={this.props.maxLength}
                            multiline={(this.props.disableReturn !== true)}
                            onChangeText={this._onTextInputValueChange.bind(this)}
                            value={this.props.value}
                            underlineColorAndroid={'rgba(0,0,0,0)'}
                            returnKeyType={this.props.returnKeyType}
                            blurOnSubmit={this.props.disableReturn}
                            autoCapitalize={this.props.autoCapitalize}
                            autoCorrect={this.props.autoCorrect}
                            onSubmitEditing={this.props.onSubmitEditing}
                        />
                    </View>
                </TouchableWithoutFeedback>
                {returnButton}
            </View>
        );
    }

    _onPress(e) {
        this.props.onPressNativeEvent(e.nativeEvent);
        this.state.refTextInput.focus();
    }

    _onSubmitButtonPress() {
        dismissKeyboard();
        this.props.onSubmitEditing();
    }

    _onLayout(e) {
        if (this.state.textInputHeight !== e.nativeEvent.layout.height) {
            let prevTextInputHeight = this.state.textInputHeight;
            this.state.textInputHeight = e.nativeEvent.layout.height;

            if (this.state.textInputFocused) {
                this.props.onTextInputLayoutChange({
                    layout: e.nativeEvent.layout,
                    heightChange: e.nativeEvent.layout.height - prevTextInputHeight,
                });
            }
        }
    }

    _onTextInputValueChange(value) {
        // do not allow return key
        let valueFormatted = value;

        if (this.props.disableReturn) {
            valueFormatted = valueFormatted.replace(/[\n\r]/g, '');
        }

        if (this.props.disableWhitespace) {
            valueFormatted = valueFormatted.replace(/[\s]/g, '');
        }

        if (this.props.disableNonNumeric) {
            // This removes all non numeric, non-period characters, then replaces only the first period with "x", then removes all other periods, then changes "xxx" back to the period.
            valueFormatted = valueFormatted.replace(/[^\d\.]/g, "")
                .replace(/\./, "x")
                .replace(/\./g, "")
                .replace(/x/, ".");
        }

        if (this.props.disableNonAlphanumeric) {
            valueFormatted = valueFormatted.replace(/[^A-Za-z0-9\-]/, '');
        }

        if (valueFormatted === '' && this.state.textLabelActive === true) {
            this.state.textLabelActive = false;
            Animated.timing(this.state.textLabelActiveTransform, {
                toValue: 0,
                duration: 200,
            }).start();
        }
        else if (valueFormatted !== '' && this.state.textLabelActive === false) {
            this.state.textLabelActive = true;
            Animated.timing(this.state.textLabelActiveTransform, {
                toValue: 1,
                duration: 200,
            }).start();
        }

        this.props.valueUpdated(valueFormatted);
    }
}

TextInputLabelView.defaultProps = {
    value: '',
    valueUpdated: () => {
    },
    onPressNativeEvent: () => {
    },
    onTextInputLayoutChange: () => {
    },
    onSubmitEditing: () => {
    },
    textInputLabel: 'Text Input',
    maxLength: 9999,
    returnKeyType: 'done',
    disableReturn: false,
    disableWhitespace: false,
    disableNonAlphanumeric: false,
    disableNonNumeric: false,
    autoCapitalize: 'none',
    autoCorrect: true,
    submitButton: false,
};