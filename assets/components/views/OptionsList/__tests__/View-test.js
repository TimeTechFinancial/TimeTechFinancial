import 'react-native';
import React from 'react';
import OptionsListView from '../View';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('renders correctly', () => {
    const tree = renderer.create(
        <OptionsListView/>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});