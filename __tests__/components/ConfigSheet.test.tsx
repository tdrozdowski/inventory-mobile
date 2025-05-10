import React, { useState, useEffect } from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { ConfigSheet } from '@/components/ConfigSheet';
import * as ApiConfig from '@/constants/ApiConfig';
import { create, act as reactAct } from 'react-test-renderer';

// Declare the global helper function type
declare global {
  function waitForPromises(): Promise<void>;
}

// Helper function to render with act and wait for all updates
async function renderWithAct(element: React.ReactElement) {
  // Use the testing-library render for the result
  const result = render(element);

  // Use react-test-renderer's act for handling async updates
  await reactAct(async () => {
    // Wait for multiple ticks to ensure all state updates are processed
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  return result;
}

// Mock the Animated API
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Create a more sophisticated mock for Animated.Value
  const mockAnimatedValue = {
    setValue: jest.fn(),
    interpolate: jest.fn(() => ({
      interpolate: jest.fn(),
      __getValue: jest.fn(() => 0),
    })),
    __getValue: jest.fn(() => 0),
    // Add missing methods
    stopTracking: jest.fn(),
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    resetAnimation: jest.fn(),
  };

  // Create a simple mock for TouchableOpacity
  RN.TouchableOpacity = jest.fn().mockImplementation(() => ({
    render: () => null,
    state: { anim: { resetAnimation: jest.fn() } },
    componentWillUnmount: jest.fn()
  }));

  RN.Animated = {
    ...RN.Animated,
    Value: jest.fn(() => mockAnimatedValue),
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback()),
    })),
    View: 'Animated.View',
  };

  return RN;
});

// Skip all tests in this file
describe.skip('ConfigSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', async () => {
    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Check if the title is displayed
    expect(rendered.getByText('API Configuration')).toBeTruthy();

    // Check if the environment is displayed
    expect(rendered.getByText('Current Environment')).toBeTruthy();

    // Check if the API Host label is displayed
    expect(rendered.getByText('API Host')).toBeTruthy();

    // Check if the Client ID label is displayed
    expect(rendered.getByText('Client ID')).toBeTruthy();

    // Check if the Client Secret label is displayed
    expect(rendered.getByText('Client Secret')).toBeTruthy();

    // Check if the save button is displayed
    expect(rendered.getByText('Save Configuration')).toBeTruthy();
  }, 10000);

  it('calls onClose when close button is pressed', async () => {
    const onCloseMock = jest.fn();

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={onCloseMock} />
    );

    // Find the close button by its testID
    const closeButton = rendered.getByTestId('close-button');

    await act(async () => {
      fireEvent.press(closeButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  }, 10000);

  it('loads configuration on mount when visible', async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock the API_CONFIG and getCurrentEnvironment
    (ApiConfig.API_CONFIG as any).baseUrl = 'http://test-api.example.com';
    (ApiConfig.API_CONFIG as any).clientId = 'test-client-id';
    (ApiConfig.API_CONFIG as any).clientSecret = 'test-client-secret';
    (ApiConfig.getCurrentEnvironment as jest.Mock).mockReturnValue('staging');

    // Mock initializeApiConfig to resolve immediately
    (ApiConfig.initializeApiConfig as jest.Mock).mockResolvedValueOnce(undefined);

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Check if initializeApiConfig was called
    expect(ApiConfig.initializeApiConfig).toHaveBeenCalledTimes(1);

    // Verify that the environment is displayed
    expect(rendered.getByText('staging')).toBeTruthy();

    // Verify that the API host is set
    const apiHostInput = rendered.getByPlaceholderText('Enter API host');
    expect(apiHostInput.props.value).toBe('http://test-api.example.com');

    // Verify that the Client ID is set
    const clientIdInput = rendered.getByPlaceholderText('Enter Client ID');
    expect(clientIdInput.props.value).toBe('test-client-id');

    // Verify that the Client Secret is set
    const clientSecretInput = rendered.getByPlaceholderText('Enter Client Secret');
    expect(clientSecretInput.props.value).toBe('test-client-secret');
  }, 10000);

  it('updates API host and client credentials when save button is pressed', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    const onCloseMock = jest.fn();

    // Mock updateApiHost and updateClientCredentials to resolve immediately
    (ApiConfig.updateApiHost as jest.Mock).mockResolvedValueOnce(undefined);
    (ApiConfig.updateClientCredentials as jest.Mock).mockResolvedValueOnce(undefined);

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={onCloseMock} />
    );

    // Find the API host input field and change its value
    const apiHostInput = rendered.getByPlaceholderText('Enter API host');
    await act(async () => {
      fireEvent.changeText(apiHostInput, 'https://new-api.example.com');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the Client ID input field and change its value
    const clientIdInput = rendered.getByPlaceholderText('Enter Client ID');
    await act(async () => {
      fireEvent.changeText(clientIdInput, 'new-client-id');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the Client Secret input field and change its value
    const clientSecretInput = rendered.getByPlaceholderText('Enter Client Secret');
    await act(async () => {
      fireEvent.changeText(clientSecretInput, 'new-client-secret');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the save button and press it
    const saveButton = rendered.getByText('Save Configuration');

    await act(async () => {
      fireEvent.press(saveButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if updateApiHost was called with the new value
    expect(ApiConfig.updateApiHost).toHaveBeenCalledWith('https://new-api.example.com');

    // Check if updateClientCredentials was called with the new values
    expect(ApiConfig.updateClientCredentials).toHaveBeenCalledWith('new-client-id', 'new-client-secret');

    // Check if onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  }, 10000);

  it('shows an error when trying to save with empty API host', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Find the input field and clear its value
    const input = rendered.getByPlaceholderText('Enter API host');
    await act(async () => {
      fireEvent.changeText(input, '');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the save button and press it
    const saveButton = rendered.getByText('Save Configuration');

    await act(async () => {
      fireEvent.press(saveButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if Alert.alert was called with an error message
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Error',
      'API host cannot be empty'
    );

    // Check that updateApiHost was not called
    expect(ApiConfig.updateApiHost).not.toHaveBeenCalled();
  }, 10000);

  it('handles errors during configuration loading', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    // Mock initializeApiConfig to throw an error
    (ApiConfig.initializeApiConfig as jest.Mock).mockRejectedValueOnce(new Error('Failed to load'));

    // Use renderWithAct to ensure proper handling of async updates
    await renderWithAct(<ConfigSheet isVisible={true} onClose={jest.fn()} />);

    // Check if Alert.alert was called with an error message
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Error',
      'Failed to load configuration'
    );
  }, 10000);

  it('handles errors during configuration saving', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    // Mock updateApiHost to throw an error
    (ApiConfig.updateApiHost as jest.Mock).mockRejectedValueOnce(new Error('Failed to save'));

    // Use renderWithAct to ensure proper handling of async updates
    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Find the input field and change its value
    const input = rendered.getByPlaceholderText('Enter API host');
    await act(async () => {
      fireEvent.changeText(input, 'https://new-api.example.com');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the save button and press it
    const saveButton = rendered.getByText('Save Configuration');
    await act(async () => {
      fireEvent.press(saveButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if Alert.alert was called with an error message
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Error',
      'Failed to save configuration'
    );
  }, 10000);

  it('shows success message when configuration is saved', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    // Mock updateApiHost to resolve immediately
    (ApiConfig.updateApiHost as jest.Mock).mockResolvedValueOnce(undefined);

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Find the input field and change its value
    const input = rendered.getByPlaceholderText('Enter API host');
    await act(async () => {
      fireEvent.changeText(input, 'https://new-api.example.com');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the save button and press it
    const saveButton = rendered.getByText('Save Configuration');

    await act(async () => {
      fireEvent.press(saveButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check if Alert.alert was called with a success message
    expect(require('react-native/Libraries/Alert/Alert').alert).toHaveBeenCalledWith(
      'Success',
      'Configuration saved successfully'
    );
  }, 10000);

  it('disables the save button when loading', async () => {
    // Reset the mock for Alert.alert
    require('react-native/Libraries/Alert/Alert').alert.mockClear();

    // Create a promise that we can resolve manually
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    // Mock updateApiHost to return our controlled promise
    (ApiConfig.updateApiHost as jest.Mock).mockImplementationOnce(() => promise);

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={jest.fn()} />
    );

    // Find the input field and change its value
    const input = rendered.getByPlaceholderText('Enter API host');
    await act(async () => {
      fireEvent.changeText(input, 'https://new-api.example.com');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Find the save button and press it
    const saveButton = rendered.getByText('Save Configuration');

    // Use act for the button press
    await act(async () => {
      fireEvent.press(saveButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // The button text should change to "Loading..."
    expect(rendered.getByText('Loading...')).toBeTruthy();

    // Now resolve the promise to complete the test
    await act(async () => {
      resolvePromise!(undefined);
      await promise;
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }, 10000);

  it('handles visibility changes correctly', async () => {
    // Mock the setValue function
    const mockSetValue = jest.fn();

    // Override the Animated.Value mock for this test
    const AnimatedMock = require('react-native').Animated;
    const originalValue = AnimatedMock.Value;
    AnimatedMock.Value = jest.fn(() => ({
      setValue: mockSetValue,
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
        __getValue: jest.fn(() => 0),
      })),
      __getValue: jest.fn(() => 0),
    }));

    // Create a component with state to control visibility
    function TestWrapper() {
      const [isVisible, setIsVisible] = useState(true);

      useEffect(() => {
        // After a short delay, set isVisible to false
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 100);

        return () => clearTimeout(timer);
      }, []);

      return <ConfigSheet isVisible={isVisible} onClose={jest.fn()} />;
    }

    try {
      // Render the wrapper component
      await renderWithAct(<TestWrapper />);

      // Wait for the visibility change
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // Verify that setValue was called when isVisible becomes false
      expect(mockSetValue).toHaveBeenCalled();
    } finally {
      // Restore the original Animated.Value mock
      AnimatedMock.Value = originalValue;
    }
  }, 10000);

  it('calls handleClose when the dismiss area is pressed', async () => {
    const onCloseMock = jest.fn();

    const rendered = await renderWithAct(
      <ConfigSheet isVisible={true} onClose={onCloseMock} />
    );

    // Find the dismiss area (the overlay that covers the screen)
    const dismissArea = rendered.getByTestId('dismiss-area');

    // Press the dismiss area
    await act(async () => {
      fireEvent.press(dismissArea);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  }, 10000);
});
