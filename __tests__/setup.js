// Use fake timers
jest.useFakeTimers();

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock the Animated API
  RN.Animated = {
    ...RN.Animated,
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(callback => {
        if (callback) {
          // Call the callback synchronously to avoid async issues
          callback();
        }
      }),
    })),
    View: 'Animated.View',
  };

  return RN;
});

// Mock the Alert API
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the components
jest.mock('@/components/ThemedText', () => {
  const { Text } = require('react-native');
  const actualModule = jest.requireActual('@/components/ThemedText');

  // Define the styles based on the actual component
  const styles = {
    default: {
      fontSize: 16,
      lineHeight: 24,
    },
    defaultSemiBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    link: {
      lineHeight: 30,
      fontSize: 16,
      color: '#0a7ea4',
    },
  };

  return {
    ...actualModule,
    ThemedText: ({ children, type = 'default', style, ...props }) => {
      // Apply the appropriate style based on the type
      const colorStyle = { color: '#000000' }; // Mock the useThemeColor hook to match test expectations

      return (
        <Text
          style={[
            colorStyle,
            type === 'default' ? styles.default : undefined,
            type === 'title' ? styles.title : undefined,
            type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
            type === 'subtitle' ? styles.subtitle : undefined,
            type === 'link' ? styles.link : undefined,
            style,
          ]}
          {...props}
        >
          {children}
        </Text>
      );
    },
  };
});

jest.mock('@/components/ThemedView', () => {
  const { View } = require('react-native');
  const actualModule = jest.requireActual('@/components/ThemedView');

  return {
    ...actualModule,
    ThemedView: ({ children, style, ...props }) => {
      // Apply the background color style (mock the useThemeColor hook)
      const backgroundStyle = { backgroundColor: '#FFFFFF' };

      return (
        <View testID="themed-view" style={[backgroundStyle, style]} {...props}>
          {children}
        </View>
      );
    },
  };
});

jest.mock('@/components/ui/IconSymbol', () => {
  const { View, Text } = require('react-native');
  const actualModule = jest.requireActual('@/components/ui/IconSymbol');

  // Define the MAPPING object explicitly
  const MAPPING = {
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-right',
    'exclamationmark.triangle.fill': 'error',
    'arrow.clockwise': 'refresh',
    'gear': 'settings',
    'xmark.circle.fill': 'cancel',
  };

  return {
    ...actualModule,
    MAPPING,
    IconSymbol: ({ name, ...props }) => {
      const mappedName = MAPPING[name] || name;
      return (
        <View testID="material-icon" {...props}>
          <Text>{mappedName}</Text>
        </View>
      );
    },
  };
});

jest.mock('@/hooks/useColorScheme', () => {
  // Create a mutable variable to store the current color scheme
  let currentColorScheme = 'light';

  // Export a function to set the color scheme for testing
  const setColorScheme = (scheme) => {
    currentColorScheme = scheme;
  };

  return {
    useColorScheme: () => currentColorScheme,
    setColorScheme,
  };
});

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock the API Config functions
jest.mock('@/constants/ApiConfig', () => {
  const AppConfig = require('@/config/AppConfig');

  // Create a mutable API_CONFIG object
  const API_CONFIG = {
    baseUrl: 'http://localhost:3000/api/v1',
    timeout: 30000,
    environment: 'development',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    endpoints: {
      // Item endpoints
      items: '/items',
      itemById: (id) => `/items/${id}`,
      itemByAltId: (altId) => `/items/alt/${altId}`,

      // Person endpoints
      persons: '/persons',
      personById: (id) => `/persons/${id}`,
      personByAltId: (altId) => `/persons/alt/${altId}`,
      personByEmail: (email) => `/persons/email/${email}`,

      // Invoice endpoints
      invoices: '/invoices',
      invoiceById: (id) => `/invoices/${id}`,
      invoiceByAltId: (altId) => `/invoices/alt/${altId}`,
      invoicesByUserId: (userId) => `/invoices/user/${userId}`,

      // Invoice-Items endpoints
      invoiceItems: '/invoices-items',
      invoiceItemsByInvoiceId: (invoiceId) => `/invoices-items/invoice/${invoiceId}`,
      invoiceItemsByItemId: (itemId) => `/invoices-items/item/${itemId}`,
      invoiceItemByIds: (invoiceId, itemId) => `/invoices-items/${invoiceId}/${itemId}`,

      // Auth endpoint
      authorize: '/authorize',
    },
  };

  return {
    API_CONFIG,
    getCurrentEnvironment: jest.fn(() => 'development'),
    updateApiHost: jest.fn(async (baseUrl) => {
      try {
        await AppConfig.updateApiConfig('development', { baseUrl });
        API_CONFIG.baseUrl = baseUrl;
        console.log(`API host updated to ${baseUrl}`);
      } catch (error) {
        console.error('Failed to update API host:', error);
      }
    }),
    initializeApiConfig: jest.fn(async () => {
      try {
        const config = await AppConfig.getApiConfig('development');
        API_CONFIG.baseUrl = config.baseUrl;
        API_CONFIG.timeout = config.timeout;
        console.log(`API configuration initialized for development environment`);
      } catch (error) {
        console.error('Failed to initialize API configuration:', error);
      }
    }),
    getApiUrl: jest.fn(endpoint => `${API_CONFIG.baseUrl}${endpoint}`),
  };
});

// Global setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Add a helper function to wait for all pending promises
global.waitForPromises = async () => {
  // Wait for all promises to resolve
  await new Promise(resolve => setImmediate(resolve));
};

// Add a dummy test to prevent Jest from complaining about no tests
describe('setup', () => {
  it('should set up the test environment', () => {
    expect(true).toBe(true);
  });
});
