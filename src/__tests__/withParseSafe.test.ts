import { withParseSafe } from '../index';
import { assertSuccess, assertFailure, ApiResponse, createMockJsonResponse } from './test-helpers';

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('withParseSafe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work with withParseSafe higher-order function', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetchSafe = withParseSafe(fetch);
    const result = await parseFetchSafe('https://api.example.com/data').parse<ApiResponse>();

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', undefined);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should work with withParseSafe and safe validators', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const safeValidator = {
      validate: jest.fn().mockImplementation((data: unknown) => {
        if (typeof data === 'object' && data !== null && 'message' in data) {
          return {
            success: true,
            data: data as ApiResponse,
          };
        }
        return {
          success: false,
          errors: ['Invalid data structure'],
        };
      }),
    };

    const parseFetchSafe = withParseSafe(fetch);
    const result = await parseFetchSafe('https://api.example.com/data').parse<ApiResponse>({
      validator: safeValidator,
    });

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
    expect(safeValidator.validate).toHaveBeenCalledWith({
      message: 'Hello World',
      status: 200,
    });
  });

  it('should handle HTTP errors with withParseSafe', async () => {
    const mockResponse = createMockJsonResponse({}, false, 404, 'Not Found');
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetchSafe = withParseSafe(fetch);
    const result = await parseFetchSafe('https://api.example.com/data').parse();

    assertFailure(result);
    expect(result.errors).toEqual(['ParseFetch Error:HTTP 404: Not Found']);
  });

  it('should still throw on unexpected errors with withParseSafe', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const parseFetchSafe = withParseSafe(fetch);
    
    await expect(
      parseFetchSafe('https://api.example.com/data').parse()
    ).rejects.toThrow('Network error');
  });
});
