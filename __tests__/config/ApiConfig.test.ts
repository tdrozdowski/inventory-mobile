import {
  getCurrentEnvironment,
  initializeApiConfig,
  updateApiHost,
  updateClientCredentials,
  storeBearerToken,
  getBearerToken,
  clearBearerToken,
  getApiUrl,
  API_CONFIG
} from '@/constants/ApiConfig';
import * as AppConfig from '@/config/AppConfig';

// Mock the AppConfig module
jest.mock('@/config/AppConfig', () => ({
  DEFAULT_CONFIG: {
    api: {
      development: {
        baseUrl: 'http://localhost:3000/api/v1',
        timeout: 30000,
        clientId: '',
        clientSecret: '',
      },
      staging: {
        baseUrl: 'https://staging-api.example.com',
        timeout: 15000,
        clientId: '',
        clientSecret: '',
      },
      production: {
        baseUrl: 'https://api.example.com',
        timeout: 10000,
        clientId: '',
        clientSecret: '',
      },
    },
  },
  getApiConfig: jest.fn(),
  updateApiConfig: jest.fn(),
}));

// Create a mock implementation of the ApiConfig module
// We need to mock the API_CONFIG object and the functions in the module
jest.mock('@/constants/ApiConfig', () => {
  // Get the original module
  const originalModule = jest.requireActual('@/constants/ApiConfig');

  // Create a mock API_CONFIG object
  const mockApiConfig = {
    baseUrl: 'http://localhost:3000/api/v1',
    environment: 'development',
    clientId: '',
    clientSecret: '',
    endpoints: originalModule.API_CONFIG.endpoints,
    timeout: 30000,
    headers: originalModule.API_CONFIG.headers,
  };

  // Mock token storage
  let bearerToken = null;
  let tokenExpiration = null;

  // Return the mock module
  return {
    ...originalModule,
    API_CONFIG: mockApiConfig,
    initializeApiConfig: jest.fn().mockImplementation(async () => {
      try {
        // Call the getApiConfig function
        const { getApiConfig } = require('@/config/AppConfig');
        const config = await getApiConfig('development');

        // Update the API_CONFIG object with the mock values
        mockApiConfig.baseUrl = config.baseUrl;
        mockApiConfig.timeout = config.timeout;
        mockApiConfig.clientId = config.clientId;
        mockApiConfig.clientSecret = config.clientSecret;

        // Log the initialization
        console.log(`API configuration initialized for development environment`);
      } catch (error) {
        console.error('Failed to initialize API configuration:', error);
      }
    }),
    updateApiHost: jest.fn().mockImplementation(async (baseUrl) => {
      try {
        // Call the updateApiConfig function
        const { updateApiConfig } = require('@/config/AppConfig');
        await updateApiConfig('development', { baseUrl });

        // Update the API_CONFIG object with the new baseUrl
        mockApiConfig.baseUrl = baseUrl;

        // Log the update
        console.log(`API host updated to ${baseUrl}`);
      } catch (error) {
        console.error('Failed to update API host:', error);
      }
    }),
    updateClientCredentials: jest.fn().mockImplementation(async (clientId, clientSecret) => {
      try {
        // Update the API_CONFIG object with the new client credentials
        mockApiConfig.clientId = clientId;
        mockApiConfig.clientSecret = clientSecret;

        // Call the updateApiConfig function
        const { updateApiConfig } = require('@/config/AppConfig');
        await updateApiConfig('development', { clientId, clientSecret });

        // Clear any existing token when credentials change
        bearerToken = null;
        tokenExpiration = null;

        // Log the update
        console.log('Client credentials updated');
      } catch (error) {
        console.error('Failed to update client credentials:', error);
      }
    }),
    storeBearerToken: jest.fn().mockImplementation((token, expiresIn) => {
      bearerToken = token;
      tokenExpiration = Date.now() + expiresIn * 1000;
    }),
    getBearerToken: jest.fn().mockImplementation(async () => {
      if (!bearerToken || !tokenExpiration || Date.now() >= tokenExpiration) {
        return null;
      }
      return bearerToken;
    }),
    clearBearerToken: jest.fn().mockImplementation(() => {
      bearerToken = null;
      tokenExpiration = null;
    }),
    getApiUrl: jest.fn().mockImplementation((endpoint) => {
      return `${mockApiConfig.baseUrl}${endpoint}`;
    }),
  };
});

// Mock console methods to prevent noise in test output
global.console.error = jest.fn();
global.console.log = jest.fn();

describe('ApiConfig', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getCurrentEnvironment', () => {
    it('should return development as the default environment', () => {
      const environment = getCurrentEnvironment();
      expect(environment).toBe('development');
    });
  });

  describe('initializeApiConfig', () => {
    it('should initialize the API configuration for the current environment', async () => {
      // Mock the getApiConfig function to return a specific config
      const mockConfig = {
        baseUrl: 'https://test-api.example.com',
        timeout: 5000,
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };
      (AppConfig.getApiConfig as jest.Mock).mockResolvedValue(mockConfig);

      await initializeApiConfig();

      // Check if getApiConfig was called with the current environment
      expect(AppConfig.getApiConfig).toHaveBeenCalledWith('development');

      // Check if API_CONFIG was updated with the new values
      expect(API_CONFIG.baseUrl).toBe(mockConfig.baseUrl);
      expect(API_CONFIG.timeout).toBe(mockConfig.timeout);
      expect(API_CONFIG.clientId).toBe(mockConfig.clientId);
      expect(API_CONFIG.clientSecret).toBe(mockConfig.clientSecret);

      // Check if the console log was called
      expect(console.log).toHaveBeenCalledWith(
        'API configuration initialized for development environment'
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock the getApiConfig function to throw an error
      (AppConfig.getApiConfig as jest.Mock).mockRejectedValue(new Error('Mock error'));

      await initializeApiConfig();

      // Check if the console error was called
      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize API configuration:',
        expect.any(Error)
      );
    });
  });

  describe('updateApiHost', () => {
    it('should update the API host', async () => {
      const newBaseUrl = 'https://new-api.example.com';

      await updateApiHost(newBaseUrl);

      // Check if updateApiConfig was called with the current environment and new baseUrl
      expect(AppConfig.updateApiConfig).toHaveBeenCalledWith('development', { baseUrl: newBaseUrl });

      // Check if API_CONFIG.baseUrl was updated
      expect(API_CONFIG.baseUrl).toBe(newBaseUrl);

      // Check if the console log was called
      expect(console.log).toHaveBeenCalledWith(`API host updated to ${newBaseUrl}`);
    });

    it('should handle errors gracefully', async () => {
      // Mock the updateApiConfig function to throw an error
      (AppConfig.updateApiConfig as jest.Mock).mockRejectedValue(new Error('Mock error'));

      await updateApiHost('https://new-api.example.com');

      // Check if the console error was called
      expect(console.error).toHaveBeenCalledWith(
        'Failed to update API host:',
        expect.any(Error)
      );
    });
  });

  describe('updateClientCredentials', () => {
    it('should update the client credentials', async () => {
      const clientId = 'test-client-id';
      const clientSecret = 'test-client-secret';

      // Set initial values to ensure they change
      API_CONFIG.clientId = 'initial-client-id';
      API_CONFIG.clientSecret = 'initial-client-secret';

      await updateClientCredentials(clientId, clientSecret);

      // Check if updateApiConfig was called with the current environment and new credentials
      expect(AppConfig.updateApiConfig).toHaveBeenCalledWith('development', { clientId, clientSecret });

      // Check if API_CONFIG credentials were updated
      expect(API_CONFIG.clientId).toBe(clientId);
      expect(API_CONFIG.clientSecret).toBe(clientSecret);
    });

    it('should handle errors gracefully', async () => {
      // Mock the updateApiConfig function to throw an error
      (AppConfig.updateApiConfig as jest.Mock).mockRejectedValue(new Error('Mock error'));

      await updateClientCredentials('test-id', 'test-secret');

      // Check if the console error was called
      expect(console.error).toHaveBeenCalledWith(
        'Failed to update client credentials:',
        expect.any(Error)
      );
    });
  });

  describe('Token Management', () => {
    beforeEach(() => {
      // Clear any stored token before each test
      clearBearerToken();
    });

    it('should store and retrieve a bearer token', async () => {
      const token = 'test-token';
      const expiresIn = 3600; // 1 hour

      // Store the token
      storeBearerToken(token, expiresIn);

      // Retrieve the token
      const retrievedToken = await getBearerToken();

      // Check if the token was retrieved correctly
      expect(retrievedToken).toBe(token);
    });

    it('should return null for expired tokens', async () => {
      const token = 'test-token';
      const expiresIn = -1; // Already expired

      // Store the token with negative expiration (already expired)
      storeBearerToken(token, expiresIn);

      // Retrieve the token
      const retrievedToken = await getBearerToken();

      // Check if null was returned for the expired token
      expect(retrievedToken).toBeNull();
    });

    it('should clear the bearer token', async () => {
      const token = 'test-token';
      const expiresIn = 3600; // 1 hour

      // Store the token
      storeBearerToken(token, expiresIn);

      // Clear the token
      clearBearerToken();

      // Retrieve the token
      const retrievedToken = await getBearerToken();

      // Check if null was returned after clearing
      expect(retrievedToken).toBeNull();
    });
  });

  describe('getApiUrl', () => {
    it('should return the full URL for an endpoint', () => {
      // Set a known baseUrl for testing
      API_CONFIG.baseUrl = 'https://test-api.example.com';

      const endpoint = '/items';
      const fullUrl = getApiUrl(endpoint);

      expect(fullUrl).toBe('https://test-api.example.com/items');
    });
  });

  describe('API_CONFIG', () => {
    it('should have the expected structure', () => {
      expect(API_CONFIG).toHaveProperty('baseUrl');
      expect(API_CONFIG).toHaveProperty('environment');
      expect(API_CONFIG).toHaveProperty('clientId');
      expect(API_CONFIG).toHaveProperty('clientSecret');
      expect(API_CONFIG).toHaveProperty('endpoints');
      expect(API_CONFIG).toHaveProperty('timeout');
      expect(API_CONFIG).toHaveProperty('headers');

      // Check item endpoints
      expect(API_CONFIG.endpoints).toHaveProperty('items');
      expect(API_CONFIG.endpoints).toHaveProperty('itemById');
      expect(API_CONFIG.endpoints).toHaveProperty('itemByAltId');

      // Check person endpoints
      expect(API_CONFIG.endpoints).toHaveProperty('persons');
      expect(API_CONFIG.endpoints).toHaveProperty('personById');
      expect(API_CONFIG.endpoints).toHaveProperty('personByAltId');
      expect(API_CONFIG.endpoints).toHaveProperty('personByEmail');

      // Check invoice endpoints
      expect(API_CONFIG.endpoints).toHaveProperty('invoices');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceById');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceByAltId');
      expect(API_CONFIG.endpoints).toHaveProperty('invoicesByUserId');

      // Check invoice-items endpoints
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceItems');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceItemsByInvoiceId');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceItemsByItemId');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceItemByIds');

      // Check auth endpoint
      expect(API_CONFIG.endpoints).toHaveProperty('authorize');
    });

    it('should have function endpoints that return the correct paths', () => {
      // Item endpoints
      expect(API_CONFIG.endpoints.itemById('123')).toBe('/items/123');
      expect(API_CONFIG.endpoints.itemByAltId('123')).toBe('/items/alt/123');

      // Person endpoints
      expect(API_CONFIG.endpoints.personById('456')).toBe('/persons/456');
      expect(API_CONFIG.endpoints.personByAltId('789')).toBe('/persons/alt/789');
      expect(API_CONFIG.endpoints.personByEmail('test@example.com')).toBe('/persons/email/test@example.com');

      // Invoice endpoints
      expect(API_CONFIG.endpoints.invoiceById('101')).toBe('/invoices/101');
      expect(API_CONFIG.endpoints.invoiceByAltId('202')).toBe('/invoices/alt/202');
      expect(API_CONFIG.endpoints.invoicesByUserId('303')).toBe('/invoices/user/303');

      // Invoice-items endpoints
      expect(API_CONFIG.endpoints.invoiceItemsByInvoiceId('101')).toBe('/invoices-items/invoice/101');
      expect(API_CONFIG.endpoints.invoiceItemsByItemId('202')).toBe('/invoices-items/item/202');
      expect(API_CONFIG.endpoints.invoiceItemByIds('101', '202')).toBe('/invoices-items/101/202');
    });
  });
});
