import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch } from 'react-native';
import { ErrorDisplay } from '@/components/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders correctly with basic props', () => {
    const { getByText } = render(
      <ErrorDisplay message="Test error message" />
    );

    // Check if the error message is displayed
    expect(getByText('Test error message')).toBeTruthy();

    // Check if the error title is displayed
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('renders retry button when onRetry prop is provided', () => {
    const onRetryMock = jest.fn();
    const { getByText } = render(
      <ErrorDisplay message="Test error message" onRetry={onRetryMock} />
    );

    // Check if the retry button is displayed
    const retryButton = getByText('Try Again');
    expect(retryButton).toBeTruthy();

    // Simulate a press on the retry button
    fireEvent.press(retryButton);

    // Check if the onRetry callback was called
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry prop is not provided', () => {
    const { queryByText } = render(
      <ErrorDisplay message="Test error message" />
    );

    // Check that the retry button is not displayed
    expect(queryByText('Try Again')).toBeNull();
  });

  it('renders debug toggle when API details are provided', () => {
    const { getByText } = render(
      <ErrorDisplay 
        message="Test error message" 
        apiUrl="https://api.example.com" 
        apiEnvironment="development" 
      />
    );

    // Check if the debug toggle is displayed
    expect(getByText('Show Debug Info')).toBeTruthy();
  });

  it('does not render debug toggle when API details are not provided', () => {
    const { queryByText } = render(
      <ErrorDisplay message="Test error message" />
    );

    // Check that the debug toggle is not displayed
    expect(queryByText('Show Debug Info')).toBeNull();
  });

  it('toggles debug info visibility when switch is pressed', () => {
    const { getByText, queryByText, UNSAFE_getAllByType } = render(
      <ErrorDisplay 
        message="Test error message" 
        apiUrl="https://api.example.com" 
        apiEnvironment="development" 
      />
    );

    // Initially, debug info should not be visible
    expect(queryByText('API URL: https://api.example.com')).toBeNull();
    expect(queryByText('Environment: development')).toBeNull();

    // Find the switch component and simulate a value change
    const switchComponent = UNSAFE_getAllByType(Switch)[0];
    fireEvent(switchComponent, 'onValueChange', true);

    // Now debug info should be visible
    expect(getByText('API URL: https://api.example.com')).toBeTruthy();
    expect(getByText('Environment: development')).toBeTruthy();
  });

  it('renders API URL in debug info when provided', () => {
    const { getByText, queryByText, UNSAFE_getAllByType } = render(
      <ErrorDisplay 
        message="Test error message" 
        apiUrl="https://api.example.com" 
      />
    );

    // Find the switch component and simulate a value change
    const switchComponent = UNSAFE_getAllByType(Switch)[0];
    fireEvent(switchComponent, 'onValueChange', true);

    // Check that API URL is displayed but not environment
    expect(getByText('API URL: https://api.example.com')).toBeTruthy();
    expect(queryByText(/Environment:/)).toBeNull();
  });

  it('renders environment in debug info when provided', () => {
    const { getByText, queryByText, UNSAFE_getAllByType } = render(
      <ErrorDisplay 
        message="Test error message" 
        apiEnvironment="development" 
      />
    );

    // Find the switch component and simulate a value change
    const switchComponent = UNSAFE_getAllByType(Switch)[0];
    fireEvent(switchComponent, 'onValueChange', true);

    // Check that environment is displayed but not API URL
    expect(getByText('Environment: development')).toBeTruthy();
    expect(queryByText(/API URL:/)).toBeNull();
  });
});
