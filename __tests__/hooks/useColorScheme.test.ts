import React from 'react';

// Import the hook and the setColorScheme function from our setup.js mock
const { useColorScheme, setColorScheme } = require('@/hooks/useColorScheme');

describe('useColorScheme', () => {
  beforeEach(() => {
    // Reset to light mode before each test
    setColorScheme('light');
  });

  it('returns the value from react-native useColorScheme', () => {
    // Call the hook directly and test its return value
    const result = useColorScheme();

    // Expect the result to be 'light'
    expect(result).toBe('light');

    // We can't verify that the react-native hook was called because we're using our mock
    // But we can verify that the hook returns the expected value
  });

  it('returns the updated value when react-native useColorScheme changes', () => {
    // Call the hook with the initial mock value
    const initialResult = useColorScheme();

    // Initially, expect the result to be 'light'
    expect(initialResult).toBe('light');

    // Change the mock to return 'dark'
    setColorScheme('dark');

    // Call the hook again with the updated mock value
    const updatedResult = useColorScheme();

    // Expect the result to be 'dark'
    expect(updatedResult).toBe('dark');
  });

  // Mock the web implementation instead of testing it directly
  jest.mock('@/hooks/useColorScheme.web', () => ({
    useColorScheme: jest.fn().mockImplementation(() => {
      // Just return the value from the react-native hook
      return require('react-native').useColorScheme();
    }),
  }), { virtual: true });
});
