// AppConfig.ts
// This file contains the configuration for the app and functions to load/save configuration

// Note: You need to install @react-native-async-storage/async-storage
// Run: npm install @react-native-async-storage/async-storage

import { Environment } from '@/constants/ApiConfig';

// Define the structure of our configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  clientId: string;
  clientSecret: string;
}

export interface AppConfig {
  api: {
    [key in Environment]: ApiConfig;
  };
}

// Default configuration
export const DEFAULT_CONFIG: AppConfig = {
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
};

// Storage key for the configuration
const CONFIG_STORAGE_KEY = 'app_config';

// Function to load the configuration
export const loadConfig = async (): Promise<AppConfig> => {
  try {
    // This is a placeholder for AsyncStorage.getItem
    // In a real implementation, you would use:
    // const configJson = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
    const configJson = null; // Placeholder

    if (configJson) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(configJson) };
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }

  return DEFAULT_CONFIG;
};

// Function to save the configuration
export const saveConfig = async (config: AppConfig): Promise<void> => {
  try {
    // This is a placeholder for AsyncStorage.setItem
    // In a real implementation, you would use:
    // await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    console.log('Saving configuration:', config); // Placeholder
  } catch (error) {
    console.error('Failed to save configuration:', error);
  }
};

// Function to update the API configuration for a specific environment
export const updateApiConfig = async (
  environment: Environment,
  apiConfig: Partial<ApiConfig>
): Promise<void> => {
  const config = await loadConfig();

  config.api[environment] = {
    ...config.api[environment],
    ...apiConfig,
  };

  await saveConfig(config);
};

// Function to get the API configuration for a specific environment
export const getApiConfig = async (
  environment: Environment
): Promise<ApiConfig> => {
  const config = await loadConfig();
  return config.api[environment];
};
