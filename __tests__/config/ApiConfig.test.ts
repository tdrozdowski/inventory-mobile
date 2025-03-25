import { 
  getCurrentEnvironment, 
  initializeApiConfig, 
  updateApiHost, 
  getApiUrl, 
  API_CONFIG 
} from '@/constants/ApiConfig';
import * as AppConfig from '@/config/AppConfig';

// Mock the AppConfig module
jest.mock('@/config/AppConfig', () => ({
  DEFAULT_CONFIG: {
    api: {
      development: {
        baseUrl: 'http://localhost:3000',
        timeout: 30000,
      },
      staging: {
        baseUrl: 'https://staging-api.example.com',
        timeout: 15000,
      },
      production: {
        baseUrl: 'https://api.example.com',
        timeout: 10000,
      },
    },
  },
  getApiConfig: jest.fn(),
  updateApiConfig: jest.fn(),
}));

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
      };
      (AppConfig.getApiConfig as jest.Mock).mockResolvedValue(mockConfig);

      await initializeApiConfig();

      // Check if getApiConfig was called with the current environment
      expect(AppConfig.getApiConfig).toHaveBeenCalledWith('development');

      // Check if API_CONFIG was updated with the new values
      expect(API_CONFIG.baseUrl).toBe(mockConfig.baseUrl);
      expect(API_CONFIG.timeout).toBe(mockConfig.timeout);

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
      expect(API_CONFIG).toHaveProperty('endpoints');
      expect(API_CONFIG).toHaveProperty('timeout');
      expect(API_CONFIG).toHaveProperty('headers');

      // Check endpoints
      expect(API_CONFIG.endpoints).toHaveProperty('items');
      expect(API_CONFIG.endpoints).toHaveProperty('itemByAltId');
      expect(API_CONFIG.endpoints).toHaveProperty('persons');
      expect(API_CONFIG.endpoints).toHaveProperty('personById');
      expect(API_CONFIG.endpoints).toHaveProperty('personByAltId');
      expect(API_CONFIG.endpoints).toHaveProperty('personByEmail');
      expect(API_CONFIG.endpoints).toHaveProperty('invoices');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceById');
      expect(API_CONFIG.endpoints).toHaveProperty('invoiceByAltId');
      expect(API_CONFIG.endpoints).toHaveProperty('invoicesByUserId');
    });

    it('should have function endpoints that return the correct paths', () => {
      expect(API_CONFIG.endpoints.itemByAltId('123')).toBe('/items/alt/123');
      expect(API_CONFIG.endpoints.personById('456')).toBe('/persons/456');
      expect(API_CONFIG.endpoints.personByAltId('789')).toBe('/persons/alt/789');
      expect(API_CONFIG.endpoints.personByEmail('test@example.com')).toBe('/persons/email/test@example.com');
      expect(API_CONFIG.endpoints.invoiceById('101')).toBe('/invoices/101');
      expect(API_CONFIG.endpoints.invoiceByAltId('202')).toBe('/invoices/alt/202');
      expect(API_CONFIG.endpoints.invoicesByUserId('303')).toBe('/invoices/user/303');
    });
  });
});
