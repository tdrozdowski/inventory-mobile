import { 
  itemsApi, 
  personsApi, 
  invoicesApi, 
  ApiError,
  Item,
  Person,
  Invoice
} from '@/services/api';
import { API_CONFIG, getApiUrl } from '@/constants/ApiConfig';

// Mock the fetch function
global.fetch = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {},
  abort: jest.fn()
}));

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the mocked fetch function
    (global.fetch as jest.Mock).mockReset();
  });

  describe('fetchApi (through API services)', () => {
    it('should make a successful API request', async () => {
      // Mock a successful response
      const mockResponse = [{ id: 1, name: 'Test Item' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      // Call the API
      const result = await itemsApi.getItems();

      // Check if fetch was called with the correct URL and options
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.items),
        expect.objectContaining({
          headers: API_CONFIG.headers,
          signal: expect.any(Object)
        })
      );

      // Check if the result is correct
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      // Mock an error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Reset the mock for the second call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

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
      // Mock a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Reset the mock for the second call
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

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
      // Create an AbortError
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      // Mock a timeout by rejecting with an AbortError
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      // Call the API and expect it to throw an error
      await expect(itemsApi.getItems()).rejects.toThrow(ApiError);

      // Reset the mock for the second call
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

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
          id: 1, 
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

    it('should get item by alt_id', async () => {
      // Mock a successful response
      const mockItem: Item = { 
        id: 1, 
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
      const newItem = { 
        name: 'New Item', 
        description: 'New Description', 
        unit_price: 19.99,
        alt_id: 'new-item',
        created_by: 'user1',
        last_changed_by: 'user1'
      };

      const createdItem: Item = { 
        ...newItem,
        id: 2, 
        created_at: '2023-01-03',
        last_update: '2023-01-03'
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

    it('should delete an item and handle non-JSON response', async () => {
      // Mock a successful response with no content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null) // No content-type header
        }
      });

      // Call the API
      await itemsApi.deleteItem(1);

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById(1)),
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
      await itemsApi.deleteItem(2);

      // Check if fetch was called with the correct URL and method
      expect(global.fetch).toHaveBeenCalledWith(
        getApiUrl(API_CONFIG.endpoints.itemById(2)),
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
          id: 1, 
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
        id: 1, 
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
  });

  describe('invoicesApi', () => {
    it('should get all invoices', async () => {
      // Mock a successful response
      const mockInvoices: Invoice[] = [
        { 
          id: 1, 
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

    it('should get invoices by user id', async () => {
      // Mock a successful response
      const mockInvoices: Invoice[] = [
        { 
          id: 1, 
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
