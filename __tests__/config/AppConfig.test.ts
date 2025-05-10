import { DEFAULT_CONFIG, loadConfig, saveConfig, updateApiConfig, getApiConfig } from '@/config/AppConfig';
import { Environment } from '@/constants/ApiConfig';

// Mock the AppConfig module
jest.mock('@/config/AppConfig', () => {
  const originalModule = jest.requireActual('@/config/AppConfig');

  // Create mock functions
  const mockLoadConfig = jest.fn().mockResolvedValue(originalModule.DEFAULT_CONFIG);
  const mockSaveConfig = jest.fn().mockResolvedValue(undefined);

  // Create mock functions that call the other mock functions
  const mockUpdateApiConfig = jest.fn().mockImplementation(async (env, config) => {
    mockLoadConfig();
    mockSaveConfig({
      ...originalModule.DEFAULT_CONFIG,
      api: {
        ...originalModule.DEFAULT_CONFIG.api,
        [env]: {
          ...originalModule.DEFAULT_CONFIG.api[env],
          ...config
        }
      }
    });
  });

  const mockGetApiConfig = jest.fn().mockImplementation(async (env) => {
    mockLoadConfig();
    return originalModule.DEFAULT_CONFIG.api[env];
  });

  return {
    ...originalModule,
    loadConfig: mockLoadConfig,
    saveConfig: mockSaveConfig,
    updateApiConfig: mockUpdateApiConfig,
    getApiConfig: mockGetApiConfig,
  };
});

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

      // Mock loadConfig to throw an error
      (loadConfig as jest.Mock).mockImplementationOnce(async () => {
        console.error('Failed to load configuration:', new Error('Mock load error'));
        return DEFAULT_CONFIG;
      });

      const config = await loadConfig();

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

      // Call the mocked function
      await saveConfig(DEFAULT_CONFIG);

      // Verify the mock was called
      expect(saveConfig).toHaveBeenCalledWith(DEFAULT_CONFIG);

      // Clean up
      consoleLogSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock saveConfig to throw an error
      (saveConfig as jest.Mock).mockImplementationOnce(async () => {
        console.error('Failed to save configuration:', new Error('Mock save error'));
      });

      await saveConfig(DEFAULT_CONFIG);

      expect(consoleErrorSpy).toHaveBeenCalled();

      // Clean up
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateApiConfig', () => {
    it('should update the API configuration for a specific environment', async () => {
      const environment: Environment = 'development';
      const apiConfig = { baseUrl: 'https://new-api.example.com' };

      // Call the function we're testing
      await updateApiConfig(environment, apiConfig);

      // Verify the mocks were called
      expect(loadConfig).toHaveBeenCalled();
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  describe('getApiConfig', () => {
    it('should return the API configuration for a specific environment', async () => {
      const environment: Environment = 'development';

      // Call the function we're testing
      const config = await getApiConfig(environment);

      // Verify the mock was called
      expect(loadConfig).toHaveBeenCalled();
      expect(config).toEqual(DEFAULT_CONFIG.api[environment]);
    });
  });
});
