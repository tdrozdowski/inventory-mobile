import React from 'react';
import { render } from '@testing-library/react-native';
import BlurTabBarBackground, { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

// Mock the dependencies
jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

describe('TabBarBackground', () => {
  describe('BlurTabBarBackground', () => {
    it('renders correctly with expected props', () => {
      // Render the component
      const { UNSAFE_getByType } = render(<BlurTabBarBackground />);

      // Get the BlurView component
      const blurView = UNSAFE_getByType('BlurView');

      // Verify the props
      expect(blurView.props.tint).toBe('systemChromeMaterial');
      expect(blurView.props.intensity).toBe(100);
      expect(blurView.props.style).toBe(StyleSheet.absoluteFill);
    });
  });

  describe('useBottomTabOverflow', () => {
    it('calculates the correct overflow value', () => {
      // Mock the return values of the dependencies
      const mockTabHeight = 83;
      const mockBottomInset = 34;
      (useBottomTabBarHeight as jest.Mock).mockReturnValue(mockTabHeight);
      (useSafeAreaInsets as jest.Mock).mockReturnValue({ bottom: mockBottomInset });

      // Call the hook
      const overflow = useBottomTabOverflow();

      // Verify the result
      expect(overflow).toBe(mockTabHeight - mockBottomInset);
    });

    it('handles zero values correctly', () => {
      // Mock the return values of the dependencies with zeros
      (useBottomTabBarHeight as jest.Mock).mockReturnValue(0);
      (useSafeAreaInsets as jest.Mock).mockReturnValue({ bottom: 0 });

      // Call the hook
      const overflow = useBottomTabOverflow();

      // Verify the result
      expect(overflow).toBe(0);
    });
  });
});
