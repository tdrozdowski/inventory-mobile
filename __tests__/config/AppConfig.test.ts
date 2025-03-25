import { DEFAULT_CONFIG, loadConfig, saveConfig, updateApiConfig, getApiConfig } from '@/config/AppConfig';
import { Environment } from '@/constants/ApiConfig';

// Mock console methods to prevent noise in test output
global.console.error = jest.fn();
global.console.log = jest.fn();

describe('AppConfig', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return DEFAULT_CONFIG when no stored config exists', async () => {
      const config = await loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Create a mock configJson that will cause JSON.parse to be called
      const mockAsyncStorage = {
        getItem: jest.fn().mockResolvedValueOnce('invalid-json'),
      };

      // Mock AsyncStorage globally
      global.AsyncStorage = mockAsyncStorage;

      // Mock JSON.parse to throw an error
      const originalJSONParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementationOnce(() => {
        throw new Error('Mock load error');
      });

      const config = await loadConfig();

      // Restore JSON.parse
      JSON.parse = originalJSONParse;

      // Delete the mock
      delete global.AsyncStorage;

      expect(config).toEqual(DEFAULT_CONFIG);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Clean up
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveConfig', () => {
    it('should log the configuration being saved', async () => {
      // Mock console.log to verify it's called
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await saveConfig(DEFAULT_CONFIG);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Saving configuration:',
        DEFAULT_CONFIG
      );

      // Clean up
      consoleLogSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock console.log to throw an error
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Mock save error');
      });

      await saveConfig(DEFAULT_CONFIG);

      expect(consoleErrorSpy).toHaveBeenCalled();

      // Clean up
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('updateApiConfig', () => {
    it('should update the API configuration for a specific environment', async () => {
      const environment: Environment = 'development';
      const apiConfig = { baseUrl: 'https://new-api.example.com' };

      // Create a mock config that will be returned by loadConfig
      const mockConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      // Mock the loadConfig function to return the mock config
      const mockLoadConfig = jest.fn().mockResolvedValue(mockConfig);

      // Mock the saveConfig function
      const mockSaveConfig = jest.fn().mockResolvedValue(undefined);

      // Replace the actual functions with our mocks
      const originalLoadConfig = require('@/config/AppConfig').loadConfig;
      const originalSaveConfig = require('@/config/AppConfig').saveConfig;
      require('@/config/AppConfig').loadConfig = mockLoadConfig;
      require('@/config/AppConfig').saveConfig = mockSaveConfig;

      try {
        // Call the function we're testing
        await updateApiConfig(environment, apiConfig);

        // Verify the mocks were called
        expect(mockLoadConfig).toHaveBeenCalled();
        expect(mockSaveConfig).toHaveBeenCalled();

        // Verify the config was updated correctly
        expect(mockSaveConfig).toHaveBeenCalledWith(expect.objectContaining({
          api: expect.objectContaining({
            [environment]: expect.objectContaining(apiConfig)
          })
        }));
      } finally {
        // Restore original implementations
        require('@/config/AppConfig').loadConfig = originalLoadConfig;
        require('@/config/AppConfig').saveConfig = originalSaveConfig;
      }
    });
  });

  describe('getApiConfig', () => {
    it('should return the API configuration for a specific environment', async () => {
      const environment: Environment = 'development';

      // Create a mock config that will be returned by loadConfig
      const mockConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      // Mock the loadConfig function to return the mock config
      const mockLoadConfig = jest.fn().mockResolvedValue(mockConfig);

      // Replace the actual function with our mock
      const originalLoadConfig = require('@/config/AppConfig').loadConfig;
      require('@/config/AppConfig').loadConfig = mockLoadConfig;

      try {
        // Call the function we're testing
        const config = await getApiConfig(environment);

        // Verify the mock was called
        expect(mockLoadConfig).toHaveBeenCalled();
        expect(config).toEqual(DEFAULT_CONFIG.api[environment]);
      } finally {
        // Restore original implementation
        require('@/config/AppConfig').loadConfig = originalLoadConfig;
      }
    });
  });
});
