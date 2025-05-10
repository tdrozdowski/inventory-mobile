// API configuration file
// This file contains the configuration for the API
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Token storage keys
const TOKEN_STORAGE_KEY = 'bearer_token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';

// In-memory cache for token
let bearerToken: string | null = null;
let tokenExpiration: number | null = null;

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
    API_CONFIG.clientId = config.clientId;
    API_CONFIG.clientSecret = config.clientSecret;

    // Try to load the token from AsyncStorage
    await getBearerToken();

    console.log(`API configuration initialized for ${currentEnv} environment`);
  } catch (error) {
    console.error('Failed to initialize API configuration:', error);
  }
};

// Function to store the bearer token
export const storeBearerToken = async (token: string, expiresIn: number): Promise<void> => {
  try {
    // Set in-memory cache
    bearerToken = token;
    // Set expiration time (current time + expiresIn in seconds)
    tokenExpiration = Date.now() + expiresIn * 1000;

    // Store in AsyncStorage for persistence
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    await AsyncStorage.setItem(TOKEN_EXPIRATION_KEY, tokenExpiration.toString());

    console.log('Token stored successfully');
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

// Function to get the bearer token
export const getBearerToken = async (): Promise<string | null> => {
  try {
    // First check in-memory cache
    if (bearerToken && tokenExpiration && Date.now() < tokenExpiration) {
      return bearerToken;
    }

    // If not in memory or expired, try to get from AsyncStorage
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    const storedExpiration = await AsyncStorage.getItem(TOKEN_EXPIRATION_KEY);

    if (storedToken && storedExpiration) {
      const expirationTime = parseInt(storedExpiration, 10);

      // Check if token is still valid
      if (Date.now() < expirationTime) {
        // Update in-memory cache
        bearerToken = storedToken;
        tokenExpiration = expirationTime;
        return storedToken;
      } else {
        // Token expired, clear it
        await clearBearerToken();
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

// Function to clear the bearer token
export const clearBearerToken = async (): Promise<void> => {
  try {
    // Clear in-memory cache
    bearerToken = null;
    tokenExpiration = null;

    // Clear from AsyncStorage
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRATION_KEY);

    console.log('Token cleared successfully');
  } catch (error) {
    console.error('Failed to clear token:', error);
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

// Function to update the client credentials
export const updateClientCredentials = async (clientId: string, clientSecret: string): Promise<void> => {
  try {
    // Update the configuration
    await updateApiConfig(currentEnv, { clientId, clientSecret });

    // Update the current configuration
    currentEnvConfig.clientId = clientId;
    currentEnvConfig.clientSecret = clientSecret;
    API_CONFIG.clientId = clientId;
    API_CONFIG.clientSecret = clientSecret;

    // Clear any existing token when credentials change
    await clearBearerToken();

    console.log('Client credentials updated');
  } catch (error) {
    console.error('Failed to update client credentials:', error);
  }
};

// The API configuration
export const API_CONFIG = {
  // Base URL for the API - from environment config
  baseUrl: currentEnvConfig.baseUrl,

  // Current environment
  environment: currentEnv,

  // Client credentials for API authentication
  clientId: currentEnvConfig.clientId,
  clientSecret: currentEnvConfig.clientSecret,

  // API endpoints
  endpoints: {
    // Item endpoints
    items: '/items',
    itemByAltId: (altId: string) => `/items/alt/${altId}`,
    itemById: (id: string) => `/items/${id}`,

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

    // Invoice-Items endpoints
    invoiceItems: '/invoices-items',
    invoiceItemsByInvoiceId: (invoiceId: string) => `/invoices-items/invoice/${invoiceId}`,
    invoiceItemsByItemId: (itemId: string) => `/invoices-items/item/${itemId}`,
    invoiceItemByIds: (invoiceId: string, itemId: string) => `/invoices-items/${invoiceId}/${itemId}`,

    // Auth endpoint
    authorize: '/authorize',
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
