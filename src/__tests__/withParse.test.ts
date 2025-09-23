import { withParse } from '../index';
import { ApiResponse, createMockJsonResponse } from './test-helpers';

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('withParse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create enhanced fetch with parse method', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetch = withParse(fetch);
    const result = await parseFetch('https://api.example.com/data').parse<ApiResponse>();

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', undefined);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should work with fetch options', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetch = withParse(fetch);
    const result = await parseFetch('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).parse<ApiResponse>();

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should work with validator', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const validator = {
      validate: jest.fn().mockImplementation((data: unknown) => data as ApiResponse),
    };

    const parseFetch = withParse(fetch);
    const result = await parseFetch('https://api.example.com/data').parse<ApiResponse>({ validator });

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(validator.validate).toHaveBeenCalledWith({ message: 'Hello World', status: 200 });
  });

  it('should preserve response properties', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetch = withParse(fetch);
    const enhancedResponse = await parseFetch('https://api.example.com/data');

    // Check that original response properties are preserved
    expect(enhancedResponse.status).toBe(200);
    expect(enhancedResponse.ok).toBe(true);
    expect(enhancedResponse.headers).toBeDefined();
    
    // Check that parse method exists
    expect(typeof enhancedResponse.parse).toBe('function');
    
    // Test the parse method
    const result = await enhancedResponse.parse<ApiResponse>();
    expect(result).toEqual({ message: 'Hello World', status: 200 });
  });
});
