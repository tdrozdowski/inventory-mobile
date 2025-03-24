import { API_CONFIG, getApiUrl } from '@/constants/ApiConfig';

// Define the Item type based on the API schema
export interface Item {
  id: number;
  alt_id: string;
  name: string;
  description: string;
  unit_price: number;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

// Define the Person type based on the API schema
export interface Person {
  id: number;
  alt_id: string;
  name: string;
  email: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

// Define the Invoice type based on the API schema
export interface Invoice {
  id: number;
  alt_id: string;
  total: number;
  paid: boolean;
  user_id: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
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

  // Set timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `API error: ${response.status} ${response.statusText}`,
        response.status,
        url,
        API_CONFIG.environment
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, url, API_CONFIG.environment);
    }

    throw new ApiError(error.message || 'Unknown error', 500, url, API_CONFIG.environment);
  }
}

// API service for items
export const itemsApi = {
  // Get all items
  getItems: async (): Promise<Item[]> => {
    return fetchApi<Item[]>(API_CONFIG.endpoints.items);
  },

  // Get item by alternative ID
  getItemByAltId: async (altId: string): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.itemByAltId(altId));
  },

  // Create a new item
  createItem: async (item: Omit<Item, 'id' | 'created_at' | 'last_update'>): Promise<Item> => {
    return fetchApi<Item>(API_CONFIG.endpoints.items, {
      method: 'POST',
      body: JSON.stringify(item),
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
};
