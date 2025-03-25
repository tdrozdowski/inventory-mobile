// API configuration file
// This file contains the configuration for the API
import { DEFAULT_CONFIG, getApiConfig, updateApiConfig } from '@/config/AppConfig';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Get the current environment
// In a real app, this might come from environment variables or build configuration
export const getCurrentEnvironment = (): Environment => {
  // For demo purposes, default to development
  // In a real app, you might use process.env.NODE_ENV or similar
  return 'development';
};

// Get the current environment
const currentEnv = getCurrentEnvironment();

// Initialize with default configuration
let currentEnvConfig = DEFAULT_CONFIG.api[currentEnv];

// Function to initialize the API configuration
// This should be called when the app starts
export const initializeApiConfig = async (): Promise<void> => {
  try {
    // Load the configuration for the current environment
    const config = await getApiConfig(currentEnv);

    // Update the current environment configuration
    currentEnvConfig = config;

    // Update the API_CONFIG object
    API_CONFIG.baseUrl = config.baseUrl;
    API_CONFIG.timeout = config.timeout;

    console.log(`API configuration initialized for ${currentEnv} environment`);
  } catch (error) {
    console.error('Failed to initialize API configuration:', error);
  }
};

// Function to update the API host
export const updateApiHost = async (baseUrl: string): Promise<void> => {
  try {
    // Update the configuration
    await updateApiConfig(currentEnv, { baseUrl });

    // Update the current configuration
    currentEnvConfig.baseUrl = baseUrl;
    API_CONFIG.baseUrl = baseUrl;

    console.log(`API host updated to ${baseUrl}`);
  } catch (error) {
    console.error('Failed to update API host:', error);
  }
};

// The API configuration
export const API_CONFIG = {
  // Base URL for the API - from environment config
  baseUrl: currentEnvConfig.baseUrl,

  // Current environment
  environment: currentEnv,

  // API endpoints
  endpoints: {
    items: '/items',
    itemByAltId: (altId: string) => `/items/alt/${altId}`,
    itemById: (id: number) => `/items/${id}`,

    // Person endpoints
    persons: '/persons',
    personById: (id: string) => `/persons/${id}`,
    personByAltId: (altId: string) => `/persons/alt/${altId}`,
    personByEmail: (email: string) => `/persons/email/${email}`,

    // Invoice endpoints
    invoices: '/invoices',
    invoiceById: (id: string) => `/invoices/${id}`,
    invoiceByAltId: (altId: string) => `/invoices/alt/${altId}`,
    invoicesByUserId: (userId: string) => `/invoices/user/${userId}`,
  },

  // Request timeout in milliseconds - from environment config
  timeout: currentEnvConfig.timeout,

  // Headers to include with every request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Function to get the full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
