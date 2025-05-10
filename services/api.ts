import { API_CONFIG, getApiUrl, getBearerToken, storeBearerToken } from '@/constants/ApiConfig';
import { Buffer } from 'buffer';

// Define the Item type based on the API schema
export interface Item {
  id: string;
  alt_id: string;
  name: string;
  description: string;
  unit_price: number;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

// Define the CreateItem DTO
export interface CreateItemDto {
  name: string;
  description: string;
  unit_price: number;
  created_by: string;
}

// Define the UpdateItem DTO
export interface UpdateItemDto {
  name?: string;
  description?: string;
  unit_price?: number;
  last_changed_by?: string;
}

// Define the Person type based on the API schema
export interface Person {
  id: string;
  alt_id: string;
  name: string;
  email: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

// Define the CreatePerson DTO
export interface CreatePersonDto {
  name: string;
  email: string;
  created_by: string;
}

// Define the UpdatePerson DTO
export interface UpdatePersonDto {
  name?: string;
  email?: string;
  last_changed_by?: string;
}

// Define the Invoice type based on the API schema
export interface Invoice {
  id: string;
  alt_id: string;
  total: number;
  paid: boolean;
  user_id: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

// Define the CreateInvoice DTO
export interface CreateInvoiceDto {
  total: number;
  paid?: boolean;
  user_id: string;
  created_by: string;
}

// Define the UpdateInvoice DTO
export interface UpdateInvoiceDto {
  total?: number;
  paid?: boolean;
  user_id?: string;
  last_changed_by?: string;
}

// Define the InvoiceItem type based on the API schema
export interface InvoiceItem {
  invoice_id: string;
  item_id: string;
}

// API error class
export class ApiError extends Error {
  status: number;
  url?: string;
  environment?: string;

  constructor(message: string, status: number, url?: string, environment?: string) {
    super(message);
    this.status = status;
    this.url = url;
    this.environment = environment;
    this.name = 'ApiError';
  }
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);

  // Set default headers
  const headers = {
    ...API_CONFIG.headers,
    ...options.headers,
  };

  // Add bearer token for all requests except the authorize endpoint
  if (endpoint !== API_CONFIG.endpoints.authorize) {
    try {
      // First try to get the stored token directly
      let token = await getBearerToken();

      // If no valid token exists, request a new one
      if (!token) {
        token = await authApi.getToken();
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get bearer token:', error);
      // Continue without token, the request might fail with 401
    }
  }

  // Set timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  // Log request details
  const requestBody = options.body ?
    (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) :
    undefined;

  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    endpoint,
    headers: { ...headers, Authorization: headers['Authorization'] ? '**REDACTED**' : undefined },
    body: requestBody,
    timestamp: new Date().toISOString(),
  });

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    clearTimeout(timeoutId);

    // Log response details
    console.log('API Response:', {
      url,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });

    if (!response.ok) {
      console.error('API Error Response:', {
        url,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
      });

      throw new ApiError(
        `API error: ${response.status} ${response.statusText}`,
        response.status,
        url,
        API_CONFIG.environment
      );
    }

    // In tests, the response object might not have headers property
    // So we need to handle that case

    // For DELETE operations, just return success
    if (options.method === 'DELETE') {
      return {} as T; // Return empty object for void/empty responses
    }

    // If the response has a json method, use it
    if (response && typeof response.json === 'function') {
      const data = await response.json();

      // Log response data (but limit size for large responses)
      const dataString = JSON.stringify(data);
      console.log('API Response Data:', {
        url,
        method: options.method || 'GET',
        dataPreview: dataString.length > 500 ? `${dataString.substring(0, 500)}... (truncated)` : dataString,
        timestamp: new Date().toISOString(),
      });

      return data;
    }

    // If we can't get JSON from the response, return an empty object
    return {} as T;
  } catch (error) {
    // Log error details
    console.error('API Request Failed:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    if (error instanceof ApiError) {
      throw error;
    }

    if (error && error.name === 'AbortError') {
      const environment = API_CONFIG && API_CONFIG.environment ? API_CONFIG.environment : 'development';
      throw new ApiError('Request timeout', 408, url, environment);
    }

    const errorMessage = error && typeof error === 'object' && error.message ? error.message : 'Unknown error';
    const environment = API_CONFIG && API_CONFIG.environment ? API_CONFIG.environment : 'development';
    throw new ApiError(errorMessage, 500, url, environment);
  }
}

// API service for items
export const itemsApi = {
  // Get all items
  getItems: async (): Promise<Item[]> => {
    return fetchApi<Item[]>(API_CONFIG.endpoints.items);
  },

  // Get item by ID
  getItemById: async (id: string): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.itemById(id));
  },

  // Get item by alternative ID
  getItemByAltId: async (altId: string): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.itemByAltId(altId));
  },

  // Create a new item
  createItem: async (item: CreateItemDto): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.items, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update an item
  updateItem: async (id: string, item: UpdateItemDto): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.itemById(id), {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete an item by ID
  deleteItem: async (id: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.itemById(id), {
      method: 'DELETE',
    });
  },
};

// API service for persons
export const personsApi = {
  // Get all persons
  getPersons: async (): Promise<Person[]> => {
    return fetchApi<Person[]>(API_CONFIG.endpoints.persons);
  },

  // Get person by ID
  getPersonById: async (id: string): Promise<Person> => {
    return fetchApi<Person>(API_CONFIG.endpoints.personById(id));
  },

  // Get person by alternative ID
  getPersonByAltId: async (altId: string): Promise<Person> => {
    return fetchApi<Person>(API_CONFIG.endpoints.personByAltId(altId));
  },

  // Get person by email
  getPersonByEmail: async (email: string): Promise<Person> => {
    return fetchApi<Person>(API_CONFIG.endpoints.personByEmail(email));
  },

  // Create a new person
  createPerson: async (person: CreatePersonDto): Promise<Person> => {
    return fetchApi<Person>(API_CONFIG.endpoints.persons, {
      method: 'POST',
      body: JSON.stringify(person),
    });
  },

  // Update a person
  updatePerson: async (id: string, person: UpdatePersonDto): Promise<Person> => {
    return fetchApi<Person>(API_CONFIG.endpoints.personById(id), {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  },

  // Delete a person by ID
  deletePerson: async (id: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.personById(id), {
      method: 'DELETE',
    });
  },
};

// API service for invoices
export const invoicesApi = {
  // Get all invoices
  getInvoices: async (): Promise<Invoice[]> => {
    return fetchApi<Invoice[]>(API_CONFIG.endpoints.invoices);
  },

  // Get invoice by ID
  getInvoiceById: async (id: string): Promise<Invoice> => {
    return fetchApi<Invoice>(API_CONFIG.endpoints.invoiceById(id));
  },

  // Get invoice by alternative ID
  getInvoiceByAltId: async (altId: string): Promise<Invoice> => {
    return fetchApi<Invoice>(API_CONFIG.endpoints.invoiceByAltId(altId));
  },

  // Get invoices by user ID
  getInvoicesByUserId: async (userId: string): Promise<Invoice[]> => {
    return fetchApi<Invoice[]>(API_CONFIG.endpoints.invoicesByUserId(userId));
  },

  // Create a new invoice
  createInvoice: async (invoice: CreateInvoiceDto): Promise<Invoice> => {
    return fetchApi<Invoice>(API_CONFIG.endpoints.invoices, {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },

  // Update an invoice
  updateInvoice: async (id: string, invoice: UpdateInvoiceDto): Promise<Invoice> => {
    return fetchApi<Invoice>(API_CONFIG.endpoints.invoiceById(id), {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  },

  // Delete an invoice by ID
  deleteInvoice: async (id: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.invoiceById(id), {
      method: 'DELETE',
    });
  },
};

// API service for invoice items
export const invoiceItemsApi = {
  // Get all invoice items
  getInvoiceItems: async (): Promise<InvoiceItem[]> => {
    return fetchApi<InvoiceItem[]>(API_CONFIG.endpoints.invoiceItems);
  },

  // Get invoice items by invoice ID
  getInvoiceItemsByInvoiceId: async (invoiceId: string): Promise<InvoiceItem[]> => {
    return fetchApi<InvoiceItem[]>(API_CONFIG.endpoints.invoiceItemsByInvoiceId(invoiceId));
  },

  // Get invoice items by item ID
  getInvoiceItemsByItemId: async (itemId: string): Promise<InvoiceItem[]> => {
    return fetchApi<InvoiceItem[]>(API_CONFIG.endpoints.invoiceItemsByItemId(itemId));
  },

  // Get specific invoice item
  getInvoiceItem: async (invoiceId: string, itemId: string): Promise<InvoiceItem> => {
    return fetchApi<InvoiceItem>(API_CONFIG.endpoints.invoiceItemByIds(invoiceId, itemId));
  },

  // Create a new invoice item
  createInvoiceItem: async (invoiceItem: InvoiceItem): Promise<InvoiceItem> => {
    return fetchApi<InvoiceItem>(API_CONFIG.endpoints.invoiceItems, {
      method: 'POST',
      body: JSON.stringify(invoiceItem),
    });
  },

  // Delete invoice items by invoice ID
  deleteInvoiceItemsByInvoiceId: async (invoiceId: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.invoiceItemsByInvoiceId(invoiceId), {
      method: 'DELETE',
    });
  },

  // Delete invoice items by item ID
  deleteInvoiceItemsByItemId: async (itemId: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.invoiceItemsByItemId(itemId), {
      method: 'DELETE',
    });
  },

  // Delete specific invoice item
  deleteInvoiceItem: async (invoiceId: string, itemId: string): Promise<void> => {
    return fetchApi<void>(API_CONFIG.endpoints.invoiceItemByIds(invoiceId, itemId), {
      method: 'DELETE',
    });
  },
};

// Define the AuthResponse type
export interface AuthResponse {
  token: string;
}

// API service for authorization
export const authApi = {
  // Authorize with client credentials
  authorize: async (customClientId?: string, customClientSecret?: string): Promise<AuthResponse> => {
    // Use custom credentials if provided, otherwise use the ones from API_CONFIG
    const clientId = customClientId || API_CONFIG.clientId;
    const clientSecret = customClientSecret || API_CONFIG.clientSecret;

    // Create basic auth token from client credentials
    const credentials = `${clientId}:${clientSecret}`;
    const basicAuth = `Basic ${Buffer.from(credentials).toString('base64')}`;

    // Use fetch directly to avoid circular dependency with fetchApi
    const url = getApiUrl(API_CONFIG.endpoints.authorize);

    // Set timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    // Log authorization request (without exposing credentials)
    console.log('Auth API Request:', {
      url,
      method: 'POST',
      endpoint: API_CONFIG.endpoints.authorize,
      headers: {
        'Authorization': '**REDACTED**',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: 'grant_type=client_credentials',
      timestamp: new Date().toISOString(),
    });

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: '',
        signal: controller.signal,
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      clearTimeout(timeoutId);

      // Log response details
      console.log('Auth API Response:', {
        url,
        method: 'POST',
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        console.error('Auth API Error Response:', {
          url,
          method: 'POST',
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
        });

        throw new ApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status,
          url,
          API_CONFIG.environment
        );
      }

      const data = await response.json() as AuthResponse;

      // Log token received (without exposing the actual token)
      console.log('Auth API Token Received:', {
        url,
        tokenReceived: !!data.token,
        timestamp: new Date().toISOString(),
      });

      // Store the bearer token for future use
      if (data && data.token) {
        // Since the response doesn't include an expires_in field, set a default expiration time (1 hour)
        const defaultExpiresIn = 3600; // 1 hour in seconds
        storeBearerToken(data.token, defaultExpiresIn);
      }

      return data;
    } catch (error) {
      // Log error details
      console.error('Auth API Request Failed:', {
        url,
        method: 'POST',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      if (error instanceof ApiError) {
        throw error;
      }

      if (error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, url, API_CONFIG.environment);
      }

      const errorMessage = error && typeof error === 'object' && error.message ? error.message : 'Unknown error';
      throw new ApiError(errorMessage, 500, url, API_CONFIG.environment);
    }
  },

  // Get a valid token (refreshes if needed)
  getToken: async (customClientId?: string, customClientSecret?: string): Promise<string> => {
    // Try to get an existing token
    const token = await getBearerToken();

    // If we have a valid token, return it
    if (token) {
      return token;
    }

    // Otherwise, get a new token with custom credentials if provided
    const response = await authApi.authorize(customClientId, customClientSecret);
    return response.token;
  },
};
