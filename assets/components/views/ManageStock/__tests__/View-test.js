import 'react-native';
import React from 'react';
import ManageStockView from '../View';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

test('renders correctly', () => {
    const tree = renderer.create(
        <ManageStockView/>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});