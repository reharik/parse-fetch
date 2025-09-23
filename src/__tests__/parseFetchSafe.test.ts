import { parseFetchSafe, parseFetch } from '../index';
import { assertSuccess, assertFailure, ApiResponse, createMockJsonResponse } from './test-helpers';

describe('parseFetchSafe', () => {
  it('should return success result for valid JSON', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });

    const result = await parseFetchSafe<ApiResponse>(mockResponse);

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
  });

  it('should return error result for HTTP errors', async () => {
    const mockResponse = createMockJsonResponse({}, false, 404, 'Not Found');

    const result = await parseFetchSafe(mockResponse);

    assertFailure(result);
    expect(result.errors).toEqual(['ParseFetch Error:HTTP 404: Not Found']);
  });

  it('should return error result for validation failures', async () => {
    const mockResponse = createMockJsonResponse({ invalid: 'data' });

    const safeValidator = {
      validate: jest.fn().mockImplementation(() => ({
        success: false,
        errors: ['Validation error'],
      })),
    };

    const result = await parseFetchSafe<{ message: string }>(mockResponse, { validator: safeValidator });

    assertFailure(result);
    expect(result.errors).toEqual(['Validation error']);
  });

  it('should work with safe validators that return result objects', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });

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

    const result = await parseFetchSafe<ApiResponse>(mockResponse, {
      validator: safeValidator,
    });

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
    expect(safeValidator.validate).toHaveBeenCalledWith({
      message: 'Hello World',
      status: 200,
    });
  });

  it('should return error result for parsing failures', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchSafe(mockResponse);
    assertFailure(result);
    expect(result.errors).toEqual(['parseFetch failed: Failed to parse JSON: Invalid JSON']);
  });

  it('should work with safe validator in parseFetch (returns ParseResult)', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });

    const safeValidator = {
      validate: jest.fn().mockImplementation((data: unknown) => ({
        success: true,
        data: data as ApiResponse,
      })),
    };

    const result = await parseFetch<ApiResponse>(mockResponse, { validator: safeValidator });
    expect(result).toEqual({ message: 'Hello World', status: 200 });
  });

  it('should work with throwing validator in parseFetchSafe (returns T)', async () => {
    const mockResponse = createMockJsonResponse({ message: 'Hello World', status: 200 });

    const validator = {
      validate: jest.fn().mockImplementation((data: unknown) => data as ApiResponse),
    };

    const result = await parseFetchSafe<ApiResponse>(mockResponse, { validator });

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
  });

  it('should handle safe validator failures', async () => {
    const mockResponse = createMockJsonResponse({ invalid: 'data' });

    const safeValidator = {
      validate: jest.fn().mockImplementation(() => ({
        success: false,
        errors: ['Validation failed: missing required field'],
      })),
    };

    const result = await parseFetchSafe<ApiResponse>(mockResponse, {
      validator: safeValidator,
    });

    assertFailure(result);
    expect(result.errors).toEqual(['Validation failed: missing required field']);
  });
});
