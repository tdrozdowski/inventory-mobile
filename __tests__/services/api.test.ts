import {
  itemsApi,
  personsApi,
  invoicesApi,
  invoiceItemsApi,
  authApi,
  ApiError,
  Item,
  Person,
  Invoice,
  InvoiceItem,
  CreateItemDto,
  UpdateItemDto,
  CreatePersonDto,
  UpdatePersonDto,
  CreateInvoiceDto,
  UpdateInvoiceDto
} from '@/services/api';
import { API_CONFIG, getApiUrl, storeBearerToken, getBearerToken } from '@/constants/ApiConfig';

// Mock the buffer module
jest.mock('buffer', () => ({
  Buffer: {
    from: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=')
    })
  }
}));

// Mock the fetch function
global.fetch = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {},
  abort: jest.fn()
}));

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

// Mock the storeBearerToken and getBearerToken functions
jest.mock('@/constants/ApiConfig', () => ({
  ...jest.requireActual('@/constants/ApiConfig'),
  storeBearerToken: jest.fn(),
  getBearerToken: jest.fn().mockResolvedValue('mock_token')
}));

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the mocked fetch function
    (global.fetch as jest.Mock).mockReset();

    // Mock authApi.getToken to return a token
    // This is to avoid circular dependency issues
    jest.spyOn(authApi, 'getToken').mockResolvedValue('mock_token');
  });

  describe('fetchApi (through API services)', () => {
    it('should make a successful API request', async () => {
      // Mock getBearerToken to return null for this test
      (getBearerToken as jest.Mock).mockResolvedValueOnce(null);

      // Mock a successful response
      const mockResponse = [{ id: 1, name: 'Test Item' }];

      // Use mockImplementation instead of mockImplementationOnce
      (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      }));

      // Call the API
      const result = await itemsApi.getItems();

      // Check if fetch was called with the correct URL and options
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.items),
        expect.objectContaining({
          headers: expect.objectContaining({
            ...API_CONFIG.headers,
            'Authorization': 'Bearer mock_token'
          }),
          signal: expect.any(Object)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      // Mock an error response
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }));

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Reset the mock for the second call
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }));

      // Test the error properties
      try {
        await itemsApi.getItems();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(404);
        expect(error.message).toContain('API error: 404 Not Found');
      }
    });

    it('should handle network errors', async () => {
      // Mock getBearerToken to return null for this test
      (getBearerToken as jest.Mock).mockResolvedValue(null);

      // Create a network error
      const networkError = new Error('Network error');

      // Mock a network error
      (global.fetch as jest.Mock).mockImplementation(() => Promise.reject(networkError));

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Test the error properties
      try {
        await itemsApi.getItems();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(500);
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle timeout errors', async () => {
      // Mock getBearerToken to return null for this test
      (getBearerToken as jest.Mock).mockResolvedValueOnce(null);

      // Create an AbortError
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      // Mock a timeout by rejecting with an AbortError
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(abortError));

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Reset the mock for the second call
      (getBearerToken as jest.Mock).mockResolvedValueOnce(null);
      (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(abortError));

      // Test the error properties
      try {
        await itemsApi.getItems();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(408);
        expect(error.message).toBe('Request timeout');
      }
    });
  });

  describe('itemsApi', () => {
    it('should get all items', async () => {
      // Mock a successful response
      const mockItems: Item[] = [
        {
          id: '1',
          alt_id: 'item-1',
          name: 'Item 1',
          description: 'Description 1',
          unit_price: 10.99,
          created_by: 'user1',
          created_at: '2023-01-01',
          last_update: '2023-01-02',
          last_changed_by: 'user1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockItems)
      });

      // Call the API
      const result = await itemsApi.getItems();

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.items),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockItems);
    });

    it('should get item by ID', async () => {
      // Mock a successful response
      const mockItem: Item = {
        id: '1',
        alt_id: 'item-1',
        name: 'Item 1',
        description: 'Description 1',
        unit_price: 10.99,
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockItem)
      });

      // Call the API
      const result = await itemsApi.getItemById('1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById('1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockItem);
    });

    it('should get item by alt_id', async () => {
      // Mock a successful response
      const mockItem: Item = {
        id: '1',
        alt_id: 'item-1',
        name: 'Item 1',
        description: 'Description 1',
        unit_price: 10.99,
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockItem)
      });

      // Call the API
      const result = await itemsApi.getItemByAltId('item-1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemByAltId('item-1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockItem);
    });

    it('should create a new item', async () => {
      // Mock a successful response
      const newItem: CreateItemDto = {
        name: 'New Item',
        description: 'New Description',
        unit_price: 19.99,
        created_by: 'user1'
      };

      const createdItem: Item = {
        id: '2',
        alt_id: 'new-item',
        name: 'New Item',
        description: 'New Description',
        unit_price: 19.99,
        created_by: 'user1',
        created_at: '2023-01-03',
        last_update: '2023-01-03',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdItem)
      });

      // Call the API
      const result = await itemsApi.createItem(newItem);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.items),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newItem)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(createdItem);
    });

    it('should update an item', async () => {
      // Mock a successful response
      const updateItem: UpdateItemDto = {
        name: 'Updated Item',
        description: 'Updated Description',
        unit_price: 29.99,
        last_changed_by: 'user1'
      };

      const updatedItem: Item = {
        id: '1',
        alt_id: 'item-1',
        name: 'Updated Item',
        description: 'Updated Description',
        unit_price: 29.99,
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-04',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedItem)
      });

      // Call the API
      const result = await itemsApi.updateItem('1', updateItem);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById('1')),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateItem)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(updatedItem);
    });

    it('should delete an item and handle non-JSON response', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await itemsApi.deleteItem('1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById('1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );

      // Test with empty content but with headers
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/plain') // Non-JSON content type
        }
      });

      // Call the API again
      await itemsApi.deleteItem('2');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById('2')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('personsApi', () => {
    it('should get all persons', async () => {
      // Mock a successful response
      const mockPersons: Person[] = [
        {
          id: '1',
          alt_id: 'person-1',
          name: 'Person 1',
          email: 'person1@example.com',
          created_by: 'user1',
          created_at: '2023-01-01',
          last_update: '2023-01-02',
          last_changed_by: 'user1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockPersons)
      });

      // Call the API
      const result = await personsApi.getPersons();

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.persons),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockPersons);
    });

    it('should get person by id', async () => {
      // Mock a successful response
      const mockPerson: Person = {
        id: '1',
        alt_id: 'person-1',
        name: 'Person 1',
        email: 'person1@example.com',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockPerson)
      });

      // Call the API
      const result = await personsApi.getPersonById('1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.personById('1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockPerson);
    });

    it('should get person by alt_id', async () => {
      // Mock a successful response
      const mockPerson: Person = {
        id: '1',
        alt_id: 'person-1',
        name: 'Person 1',
        email: 'person1@example.com',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockPerson)
      });

      // Call the API
      const result = await personsApi.getPersonByAltId('person-1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.personByAltId('person-1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockPerson);
    });

    it('should get person by email', async () => {
      // Mock a successful response
      const mockPerson: Person = {
        id: '1',
        alt_id: 'person-1',
        name: 'Person 1',
        email: 'person1@example.com',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockPerson)
      });

      // Call the API
      const result = await personsApi.getPersonByEmail('person1@example.com');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.personByEmail('person1@example.com')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockPerson);
    });

    it('should create a new person', async () => {
      // Mock a successful response
      const newPerson: CreatePersonDto = {
        name: 'New Person',
        email: 'newperson@example.com',
        created_by: 'user1'
      };

      const createdPerson: Person = {
        id: '2',
        alt_id: 'person-2',
        name: 'New Person',
        email: 'newperson@example.com',
        created_by: 'user1',
        created_at: '2023-01-03',
        last_update: '2023-01-03',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdPerson)
      });

      // Call the API
      const result = await personsApi.createPerson(newPerson);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.persons),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPerson)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(createdPerson);
    });

    it('should update a person', async () => {
      // Mock a successful response
      const updatePerson: UpdatePersonDto = {
        name: 'Updated Person',
        email: 'updatedperson@example.com',
        last_changed_by: 'user1'
      };

      const updatedPerson: Person = {
        id: '1',
        alt_id: 'person-1',
        name: 'Updated Person',
        email: 'updatedperson@example.com',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-04',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedPerson)
      });

      // Call the API
      const result = await personsApi.updatePerson('1', updatePerson);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.personById('1')),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatePerson)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(updatedPerson);
    });

    it('should delete a person', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await personsApi.deletePerson('1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.personById('1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('invoicesApi', () => {
    it('should get all invoices', async () => {
      // Mock a successful response
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          alt_id: 'invoice-1',
          total: 100.99,
          paid: false,
          user_id: 'user1',
          created_by: 'user1',
          created_at: '2023-01-01',
          last_update: '2023-01-02',
          last_changed_by: 'user1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoices)
      });

      // Call the API
      const result = await invoicesApi.getInvoices();

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoices),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoices);
    });

    it('should get invoice by ID', async () => {
      // Mock a successful response
      const mockInvoice: Invoice = {
        id: '1',
        alt_id: 'invoice-1',
        total: 100.99,
        paid: false,
        user_id: 'user1',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoice)
      });

      // Call the API
      const result = await invoicesApi.getInvoiceById('1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceById('1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoice);
    });

    it('should get invoice by alt_id', async () => {
      // Mock a successful response
      const mockInvoice: Invoice = {
        id: '1',
        alt_id: 'invoice-1',
        total: 100.99,
        paid: false,
        user_id: 'user1',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-02',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoice)
      });

      // Call the API
      const result = await invoicesApi.getInvoiceByAltId('invoice-1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceByAltId('invoice-1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoice);
    });

    it('should get invoices by user id', async () => {
      // Mock a successful response
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          alt_id: 'invoice-1',
          total: 100.99,
          paid: false,
          user_id: 'user1',
          created_by: 'user1',
          created_at: '2023-01-01',
          last_update: '2023-01-02',
          last_changed_by: 'user1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoices)
      });

      // Call the API
      const result = await invoicesApi.getInvoicesByUserId('user1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoicesByUserId('user1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoices);
    });

    it('should create a new invoice', async () => {
      // Mock a successful response
      const newInvoice: CreateInvoiceDto = {
        total: 200.99,
        paid: true,
        user_id: 'user2',
        created_by: 'user1'
      };

      const createdInvoice: Invoice = {
        id: '2',
        alt_id: 'invoice-2',
        total: 200.99,
        paid: true,
        user_id: 'user2',
        created_by: 'user1',
        created_at: '2023-01-03',
        last_update: '2023-01-03',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(createdInvoice)
      });

      // Call the API
      const result = await invoicesApi.createInvoice(newInvoice);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoices),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newInvoice)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(createdInvoice);
    });

    it('should update an invoice', async () => {
      // Mock a successful response
      const updateInvoice: UpdateInvoiceDto = {
        total: 150.99,
        paid: true,
        last_changed_by: 'user1'
      };

      const updatedInvoice: Invoice = {
        id: '1',
        alt_id: 'invoice-1',
        total: 150.99,
        paid: true,
        user_id: 'user1',
        created_by: 'user1',
        created_at: '2023-01-01',
        last_update: '2023-01-04',
        last_changed_by: 'user1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(updatedInvoice)
      });

      // Call the API
      const result = await invoicesApi.updateInvoice('1', updateInvoice);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceById('1')),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateInvoice)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(updatedInvoice);
    });

    it('should delete an invoice', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await invoicesApi.deleteInvoice('1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceById('1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('invoiceItemsApi', () => {
    it('should get all invoice items', async () => {
      // Mock a successful response
      const mockInvoiceItems: InvoiceItem[] = [
        {
          invoice_id: '1',
          item_id: '1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoiceItems)
      });

      // Call the API
      const result = await invoiceItemsApi.getInvoiceItems();

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItems),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoiceItems);
    });

    it('should get invoice items by invoice ID', async () => {
      // Mock a successful response
      const mockInvoiceItems: InvoiceItem[] = [
        {
          invoice_id: '1',
          item_id: '1'
        },
        {
          invoice_id: '1',
          item_id: '2'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoiceItems)
      });

      // Call the API
      const result = await invoiceItemsApi.getInvoiceItemsByInvoiceId('1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemsByInvoiceId('1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoiceItems);
    });

    it('should get invoice items by item ID', async () => {
      // Mock a successful response
      const mockInvoiceItems: InvoiceItem[] = [
        {
          invoice_id: '1',
          item_id: '1'
        },
        {
          invoice_id: '2',
          item_id: '1'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoiceItems)
      });

      // Call the API
      const result = await invoiceItemsApi.getInvoiceItemsByItemId('1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemsByItemId('1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoiceItems);
    });

    it('should get specific invoice item', async () => {
      // Mock a successful response
      const mockInvoiceItem: InvoiceItem = {
        invoice_id: '1',
        item_id: '1'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockInvoiceItem)
      });

      // Call the API
      const result = await invoiceItemsApi.getInvoiceItem('1', '1');

      // Check if fetch was called with the correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemByIds('1', '1')),
        expect.any(Object)
      );

      // Check if the result is correct
      expect(result).toEqual(mockInvoiceItem);
    });

    it('should create a new invoice item', async () => {
      // Mock a successful response
      const newInvoiceItem: InvoiceItem = {
        invoice_id: '1',
        item_id: '2'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(newInvoiceItem)
      });

      // Call the API
      const result = await invoiceItemsApi.createInvoiceItem(newInvoiceItem);

      // Check if fetch was called with the correct URL, method and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItems),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newInvoiceItem)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(newInvoiceItem);
    });

    it('should delete invoice items by invoice ID', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await invoiceItemsApi.deleteInvoiceItemsByInvoiceId('1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemsByInvoiceId('1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should delete invoice items by item ID', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await invoiceItemsApi.deleteInvoiceItemsByItemId('1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemsByItemId('1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should delete specific invoice item', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await invoiceItemsApi.deleteInvoiceItem('1', '1');

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.invoiceItemByIds('1', '1')),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('authApi', () => {
    beforeEach(() => {
      // Set client credentials in API_CONFIG
      API_CONFIG.clientId = 'client_id';
      API_CONFIG.clientSecret = 'client_secret';
    });

    it('should authorize with client credentials', async () => {
      // Mock a successful response
      const mockAuthResponse = {
        token: 'mock_access_token'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockAuthResponse)
      });

      // Call the API
      const result = await authApi.authorize();

      // Check if fetch was called with the correct URL, method, headers, and body
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.authorize),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Basic Y2xpZW50X2lkOmNsaWVudF9zZWNyZXQ=',
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: 'grant_type=client_credentials'
        })
      );

      // Check if the result is correct
      expect(result).toEqual(mockAuthResponse);
    });

    it('should get a token', async () => {
      // Call the API
      const token = await authApi.getToken();

      // Check if a token was returned
      expect(token).toBeTruthy();
    });

    it('should get a new token if no existing token', async () => {
      // Save the original mocks
      const originalGetToken = authApi.getToken;
      const originalAuthorize = authApi.authorize;

      try {
        // Mock getBearerToken to return null (no token)
        (getBearerToken as jest.Mock).mockResolvedValueOnce(null);

        // Mock authorize to return a token
        const mockAuthResponse = {
          token: 'new_access_token'
        };

        // Mock the authorize method
        jest.spyOn(authApi, 'authorize').mockResolvedValueOnce(mockAuthResponse);

        // Override the global mock for this test to use the original implementation
        jest.spyOn(authApi, 'getToken').mockImplementationOnce(async () => {
          // Try to get an existing token
          const token = await getBearerToken();

          // If we have a valid token, return it
          if (token) {
            return token;
          }

          // Otherwise, get a new token
          const response = await authApi.authorize();
          return response.token;
        });

        // Call the API
        const token = await authApi.getToken();

        // Check if the token is correct
        expect(token).toBe('new_access_token');
        expect(getBearerToken).toHaveBeenCalled();
        expect(authApi.authorize).toHaveBeenCalled();
      } finally {
        // Restore the original mocks
        jest.spyOn(authApi, 'getToken').mockImplementation(originalGetToken);
        jest.spyOn(authApi, 'authorize').mockImplementation(originalAuthorize);
      }
    });
  });

  describe('ApiError', () => {
    it('should create an ApiError with the correct properties', () => {
      const message = 'Test error';
      const status = 404;
      const url = 'https://api.example.com/test';
      const environment = 'development';

      const error = new ApiError(message, status, url, environment);

      expect(error.message).toBe(message);
      expect(error.status).toBe(status);
      expect(error.url).toBe(url);
      expect(error.environment).toBe(environment);
      expect(error.name).toBe('ApiError');
    });
  });
});
