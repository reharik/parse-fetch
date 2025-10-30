import { parseFetch } from '../index';
import {
  ApiResponse,
  createMockJsonResponse,
  createMockTextResponse,
  createMockBinaryResponse,
} from './test-helpers';

describe('parseFetch', () => {
  it('should parse JSON response with generic type', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      status: 200,
    });

    const result = await parseFetch<ApiResponse>(mockResponse);

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(result.message).toBe('Hello World');
    expect(result.status).toBe(200);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should parse text response with string type', async () => {
    const mockResponse = createMockTextResponse('Hello World');

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('Hello World');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use provided content type option', async () => {
    const mockResponse = createMockTextResponse('Hello World', 'text/html');

    const result = await parseFetch<string>(mockResponse, {
      contentType: 'text/plain',
    });

    expect(result).toBe('Hello World');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should default to unknown type when no generic provided', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      status: 200,
    });

    const result = await parseFetch(mockResponse);

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(typeof result).toBe('object');
  });

  it('should handle XML content types', async () => {
    const mockResponse = createMockTextResponse(
      '<xml>Hello World</xml>',
      'application/xml'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('<xml>Hello World</xml>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle HTML content types', async () => {
    const mockResponse = createMockTextResponse(
      '<html>Hello World</html>',
      'text/html'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('<html>Hello World</html>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle CSV content types', async () => {
    const mockResponse = createMockTextResponse(
      'name,age\nJohn,30',
      'text/csv'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('name,age\nJohn,30');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle binary content types as ArrayBuffer', async () => {
    const buffer = new ArrayBuffer(8);
    const mockResponse = createMockBinaryResponse(buffer);

    const result = await parseFetch<ArrayBuffer>(mockResponse);

    expect(result).toBe(buffer);
    expect(mockResponse.arrayBuffer).toHaveBeenCalled();
  });

  it('should handle JavaScript content types', async () => {
    const mockResponse = createMockTextResponse(
      'console.log("Hello World")',
      'application/javascript'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('console.log("Hello World")');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle form data content types', async () => {
    const mockResponse = createMockTextResponse(
      'name=John&age=30',
      'application/x-www-form-urlencoded'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('name=John&age=30');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use JSON strategy for JSON-LD content type', async () => {
    const mockResponse = createMockJsonResponse({
      '@context': 'https://schema.org',
      name: 'John',
    });

    const result = await parseFetch(mockResponse);

    expect(result).toEqual({ '@context': 'https://schema.org', name: 'John' });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should use XML strategy for RSS content type', async () => {
    const mockResponse = createMockTextResponse(
      '<rss>Hello World</rss>',
      'application/rss+xml'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('<rss>Hello World</rss>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use default strategy for unknown content type', async () => {
    const mockResponse = createMockTextResponse(
      'Hello World',
      'application/unknown'
    );

    const result = await parseFetch<string>(mockResponse);

    expect(result).toBe('Hello World');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should work', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      status: 200,
    });

    const result = await parseFetch<ApiResponse>(mockResponse);

    expect(result).toEqual({ message: 'Hello World', status: 200 });
  });

  it('should support JSON reviver for date parsing', async () => {
    const mockResponse = createMockJsonResponse({
      message: 'Hello World',
      createdAt: '2023-12-25T12:00:00.000Z',
    });

    const reviver = (key: string, value: any) => {
      if (key === 'createdAt' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    };

    const result = await parseFetch<{ message: string; createdAt: Date }>(
      mockResponse,
      { reviver }
    );

    expect(result.message).toBe('Hello World');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.getMonth()).toBe(11); // December is month 11
  });

  it('should handle HTTP error responses', async () => {
    const mockResponse = createMockJsonResponse({}, false, 404, 'Not Found');

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'ParseFetch Error:HTTP 404: Not Found'
    );
  });

  it('should handle responses with no body', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      ok: true,
      body: null,
    } as unknown as Response;

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'ParseFetch Error:Response has no body'
    );
  });

  it('should handle JSON parsing errors', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      ok: true,
      body: {},
    } as unknown as Response;

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'parseFetch failed: Failed to parse JSON: Invalid JSON'
    );
  });

  it('should handle text parsing errors', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/plain'),
      },
      text: jest.fn().mockRejectedValue(new Error('Text parsing failed')),
      ok: true,
      body: {},
    } as unknown as Response;

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'parseFetch failed: Failed to parse text: Text parsing failed'
    );
  });

  it('should handle binary parsing errors', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/octet-stream'),
      },
      arrayBuffer: jest
        .fn()
        .mockRejectedValue(new Error('Binary parsing failed')),
      ok: true,
      body: {},
    } as unknown as Response;

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'parseFetch failed: Failed to parse binary data: Binary parsing failed'
    );
  });

  it('should handle unknown errors gracefully', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockRejectedValue('Unknown error'),
      ok: true,
      body: {},
    } as unknown as Response;

    await expect(parseFetch(mockResponse)).rejects.toThrow(
      'parseFetch failed: Failed to parse JSON: Unknown error'
    );
  });
});
