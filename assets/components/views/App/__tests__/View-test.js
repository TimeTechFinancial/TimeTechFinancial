import 'react-native';
import React from 'react';
import AppView from '../View';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('renders correctly', () => {
    const tree = renderer.create(
        <AppView/>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});