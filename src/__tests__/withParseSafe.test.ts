import { withSafeParse } from '../index';
import {
  assertSuccess,
  assertFailure,
  ApiResponse,
  createMockJsonResponse,
} from './test-helpers';

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('withSafeParse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work with withParseSafe higher-order function', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      status: 200,
    });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetchSafe = withSafeParse(fetch);
    const result = await parseFetchSafe(
      'https://api.example.com/data'
    ).parse<ApiResponse>();

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      undefined
    );
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle HTTP errors with withParseSafe', async () => {
    const mockResponse = createMockJsonResponse({}, false, 404, 'Not Found');
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const parseFetchSafe = withSafeParse(fetch);
    const result = await parseFetchSafe('https://api.example.com/data').parse();

    assertFailure(result);
    expect(result).toMatchObject({
      errors: [
        {
          kind: 'http',
          message: 'ParseFetch Error:HTTP 404: Not Found',
          status: 404,
          statusText: 'Not Found',
        },
      ],
    });
  });

  it('should reject with failure object on unexpected errors with withSafeParse', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const parseFetchSafe = withSafeParse(fetch);

    await expect(
      parseFetchSafe('https://api.example.com/data').parse()
    ).rejects.toMatchObject({
      success: false,
      errors: [
        {
          kind: 'network',
          message: 'parseFetch failed: Network error',
        },
      ],
    });
  });
});
