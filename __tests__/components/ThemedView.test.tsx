import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/ThemedView';
import { View, Text } from 'react-native';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn().mockReturnValue('#FFFFFF'),
}));

describe('ThemedView', () => {
  it('renders correctly with default props', () => {
    const { UNSAFE_getByType } = render(<ThemedView />);
    
    // Check if the view is rendered
    const viewElement = UNSAFE_getByType(View);
    expect(viewElement).toBeTruthy();
    
    // Check if the default style is applied
    expect(viewElement.props.style).toEqual(
      expect.arrayContaining([
        { backgroundColor: '#FFFFFF' },
      ])
    );
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Test Child</Text>
      </ThemedView>
    );
    
    // Check if the child is rendered
    expect(getByText('Test Child')).toBeTruthy();
  });

  it('applies custom style when provided', () => {
    const customStyle = { marginTop: 10, padding: 5 };
    const { UNSAFE_getByType } = render(<ThemedView style={customStyle} />);
    
    // Check if the view is rendered
    const viewElement = UNSAFE_getByType(View);
    expect(viewElement).toBeTruthy();
    
    // Check if the custom style is applied along with default styles
    expect(viewElement.props.style).toEqual(
      expect.arrayContaining([
        { backgroundColor: '#FFFFFF' },
        customStyle,
      ])
    );
  });

  it('passes other props to the View component', () => {
    const testID = 'test-view';
    const { getByTestId } = render(<ThemedView testID={testID} />);
    
    // Check if the testID prop is passed to the View
    expect(getByTestId(testID)).toBeTruthy();
  });
});
