import { safeParseFetch } from '../index';
import {
  assertSuccess,
  assertFailure,
  ApiResponse,
  createMockJsonResponse,
} from './test-helpers';

describe('safeParseFetch', () => {
  it('should return success result for valid JSON', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      status: 200,
    });

    const result = await safeParseFetch<ApiResponse>(mockResponse);

    assertSuccess(result);
    expect(result.data).toEqual({ message: 'Hello World', status: 200 });
  });

  it('should return error result for HTTP errors', async () => {
    const mockResponse = createMockJsonResponse({}, false, 404, 'Not Found');

    const result = await safeParseFetch(mockResponse);

    assertFailure(result);
    expect(result.errors).toEqual(['ParseFetch Error:HTTP 404: Not Found']);
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

    const result = await safeParseFetch(mockResponse);
    assertFailure(result);
    expect(result.errors).toEqual([
      'parseFetch failed: Failed to parse JSON: Invalid JSON',
    ]);
  });
});
