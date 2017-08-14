import 'react-native';
import React from 'react';
import TextInputLabelView from '../View';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('renders correctly', () => {
    const tree = renderer.create(
        <TextInputLabelView/>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});