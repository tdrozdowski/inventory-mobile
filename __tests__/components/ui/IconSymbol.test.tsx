import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Import the MAPPING from the component
import { MAPPING } from '@/components/ui/IconSymbol';

// Mock MaterialIcons
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const { View, Text } = require('react-native');
  return function MockMaterialIcons(props) {
    return (
      <View testID="material-icon" {...props}>
        <Text>{props.name}</Text>
      </View>
    );
  };
});

describe('IconSymbol', () => {
  it('renders correctly with required props', () => {
    const { getByTestId } = render(
      <IconSymbol name="house.fill" color="#000000" />
    );

    // Check if the icon is rendered
    const iconElement = getByTestId('material-icon');
    expect(iconElement).toBeTruthy();
  });

  it('maps SF Symbol names to Material Icon names correctly', () => {
    const { getByText } = render(
      <IconSymbol name="house.fill" color="#000000" />
    );

    // Check if the correct Material Icon name is used
    expect(getByText('home')).toBeTruthy();
  });

  it('passes size prop to MaterialIcons', () => {
    const size = 32;
    const { getByTestId } = render(
      <IconSymbol name="house.fill" color="#000000" size={size} />
    );

    // Check if the size prop is passed to MaterialIcons
    const iconElement = getByTestId('material-icon');
    expect(iconElement.props.size).toBe(size);
  });

  it('passes color prop to MaterialIcons', () => {
    const color = '#FF0000';
    const { getByTestId } = render(
      <IconSymbol name="house.fill" color={color} />
    );

    // Check if the color prop is passed to MaterialIcons
    const iconElement = getByTestId('material-icon');
    expect(iconElement.props.color).toBe(color);
  });

  it('passes style prop to MaterialIcons', () => {
    const style = { marginTop: 10 };
    const { getByTestId } = render(
      <IconSymbol name="house.fill" color="#000000" style={style} />
    );

    // Check if the style prop is passed to MaterialIcons
    const iconElement = getByTestId('material-icon');
    expect(iconElement.props.style).toBe(style);
  });

  it('renders different icons based on name prop', () => {
    const { getByText, rerender } = render(
      <IconSymbol name="paperplane.fill" color="#000000" />
    );

    // Check if the correct Material Icon name is used for paperplane.fill
    expect(getByText('send')).toBeTruthy();

    // Re-render with a different name
    rerender(<IconSymbol name="gear" color="#000000" />);

    // Check if the correct Material Icon name is used for gear
    expect(getByText('settings')).toBeTruthy();
  });
});
