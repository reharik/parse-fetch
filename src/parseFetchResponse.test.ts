import { parseFetchResponse, withParse } from './index';

interface ApiResponse {
  message: string;
  status: number;
}

describe('parseFetchResponse', () => {
  it('should parse JSON response with generic type', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest
        .fn()
        .mockResolvedValue({ message: 'Hello World', status: 200 }),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<ApiResponse>(mockResponse);

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(result.message).toBe('Hello World');
    expect(result.status).toBe(200);
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should parse text response with string type', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/plain'),
      },
      text: jest.fn().mockResolvedValue('Hello World'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('Hello World');
    expect(typeof result).toBe('string');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use provided content type option', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/plain'),
      },
      json: jest.fn().mockResolvedValue({ message: 'Hello World' }),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<{ message: string }>(mockResponse, {
      contentType: 'application/json',
    });

    expect(result).toEqual({ message: 'Hello World' });
    expect(result.message).toBe('Hello World');
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should default to unknown type when no generic provided', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ message: 'Hello World' }),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse(mockResponse);

    expect(result).toEqual({ message: 'Hello World' });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle XML content types', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/xml'),
      },
      text: jest.fn().mockResolvedValue('<root>Hello World</root>'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('<root>Hello World</root>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle HTML content types', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/html'),
      },
      text: jest
        .fn()
        .mockResolvedValue('<html><body>Hello World</body></html>'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('<html><body>Hello World</body></html>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle CSV content types', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/csv'),
      },
      text: jest.fn().mockResolvedValue('name,age\nJohn,30'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('name,age\nJohn,30');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle binary content types as ArrayBuffer', async () => {
    const mockBuffer = new ArrayBuffer(8);
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('image/png'),
      },
      arrayBuffer: jest.fn().mockResolvedValue(mockBuffer),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<ArrayBuffer>(mockResponse);

    expect(result).toBe(mockBuffer);
    expect(mockResponse.arrayBuffer).toHaveBeenCalled();
  });

  it('should handle JavaScript content types', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/javascript'),
      },
      text: jest.fn().mockResolvedValue('console.log("Hello World");'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('console.log("Hello World");');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should handle form data content types', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/x-www-form-urlencoded'),
      },
      text: jest.fn().mockResolvedValue('name=John&age=30'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('name=John&age=30');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use JSON strategy for JSON-LD content type', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/ld+json'),
      },
      json: jest.fn().mockResolvedValue({ '@context': 'https://schema.org' }),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<{ '@context': string }>(
      mockResponse
    );

    expect(result).toEqual({ '@context': 'https://schema.org' });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should use XML strategy for RSS content type', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/rss+xml'),
      },
      text: jest
        .fn()
        .mockResolvedValue('<rss><channel><title>Test</title></channel></rss>'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('<rss><channel><title>Test</title></channel></rss>');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should use default strategy for unknown content type', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/unknown-type'),
      },
      text: jest.fn().mockResolvedValue('unknown content'),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<string>(mockResponse);

    expect(result).toBe('unknown content');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should validate JSON response with custom validator', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest
        .fn()
        .mockResolvedValue({ message: 'Hello World', status: 200 }),
      ok: true,
      body: {},
    } as unknown as Response;

    const validator = {
      validate: jest.fn().mockImplementation(data => {
        if (typeof data === 'object' && data !== null && 'message' in data) {
          return data;
        }
        throw new Error('Invalid data');
      }),
    };

    const result = await parseFetchResponse<{
      message: string;
      status: number;
    }>(mockResponse, {
      validator,
    });

    expect(result).toEqual({ message: 'Hello World', status: 200 });
    expect(validator.validate).toHaveBeenCalledWith({
      message: 'Hello World',
      status: 200,
    });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should validate text response with custom validator', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('text/plain'),
      },
      text: jest.fn().mockResolvedValue('Hello World'),
      ok: true,
      body: {},
    } as unknown as Response;

    const validator = {
      validate: jest.fn().mockImplementation(data => {
        if (typeof data === 'string' && data.length > 0) {
          return data.toUpperCase();
        }
        throw new Error('Invalid string');
      }),
    };

    const result = await parseFetchResponse<string>(mockResponse, {
      validator,
    });

    expect(result).toBe('HELLO WORLD');
    expect(validator.validate).toHaveBeenCalledWith('Hello World');
    expect(mockResponse.text).toHaveBeenCalled();
  });

  it('should work without validator (backward compatibility)', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ message: 'Hello World' }),
      ok: true,
      body: {},
    } as unknown as Response;

    const result = await parseFetchResponse<{ message: string }>(mockResponse);

    expect(result).toEqual({ message: 'Hello World' });
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should support JSON reviver for date parsing', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ 
        message: 'Hello World', 
        createdAt: '2023-12-25T12:00:00.000Z' 
      }),
      ok: true,
      body: {},
    } as unknown as Response;

    const reviver = (key: string, value: any) => {
      if (key === 'createdAt' && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    };

    const result = await parseFetchResponse<{ 
      message: string; 
      createdAt: Date 
    }>(mockResponse, { reviver });

    expect(result.message).toBe('Hello World');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.getFullYear()).toBe(2023);
    expect(result.createdAt.getMonth()).toBe(11); // December (0-indexed)
    expect(mockResponse.json).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ invalid: 'data' }),
      ok: true,
      body: {},
    } as unknown as Response;

    const validator = {
      validate: jest.fn().mockImplementation(() => {
        throw new Error('Validation failed');
      }),
    };

    await expect(
      parseFetchResponse<{ message: string }>(mockResponse, { validator })
    ).rejects.toThrow('Validation failed');

    expect(validator.validate).toHaveBeenCalledWith({ invalid: 'data' });
  });

  it('should handle HTTP error responses', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response;

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'HTTP 404: Not Found'
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

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'Response has no body'
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

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'parseFetchResponse failed: Failed to parse JSON: Invalid JSON'
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

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'parseFetchResponse failed: Failed to parse text: Text parsing failed'
    );
  });

  it('should handle binary parsing errors', async () => {
    const mockResponse = {
      headers: {
        get: jest.fn().mockReturnValue('image/png'),
      },
      arrayBuffer: jest
        .fn()
        .mockRejectedValue(new Error('Binary parsing failed')),
      ok: true,
      body: {},
    } as unknown as Response;

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'parseFetchResponse failed: Failed to parse binary data: Binary parsing failed'
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

    await expect(parseFetchResponse(mockResponse)).rejects.toThrow(
      'parseFetchResponse failed: Failed to parse JSON: Unknown error'
    );
  });

  describe('withParse higher-order function', () => {
    beforeEach(() => {
      // Mock global fetch
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create enhanced fetch with parse method', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest
          .fn()
          .mockResolvedValue({ message: 'Hello World', status: 200 }),
        ok: true,
        body: {},
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const parseFetch = withParse(fetch);
      const result = await parseFetch(
        'https://api.example.com/data'
      ).parse<ApiResponse>();

      expect(result).toEqual({ message: 'Hello World', status: 200 });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        undefined
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should work with fetch options', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest
          .fn()
          .mockResolvedValue({ message: 'Hello World', status: 200 }),
        ok: true,
        body: {},
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const parseFetch = withParse(fetch);
      const result = await parseFetch('https://api.example.com/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).parse<ApiResponse>();

      expect(result).toEqual({ message: 'Hello World', status: 200 });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should work with validator', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest
          .fn()
          .mockResolvedValue({ message: 'Hello World', status: 200 }),
        ok: true,
        body: {},
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const validator = {
        validate: jest.fn().mockImplementation(data => {
          if (typeof data === 'object' && data !== null && 'message' in data) {
            return data;
          }
          throw new Error('Invalid data');
        }),
      };

      const parseFetch = withParse(fetch);
      const result = await parseFetch(
        'https://api.example.com/data'
      ).parse<ApiResponse>({ validator });

      expect(result).toEqual({ message: 'Hello World', status: 200 });
      expect(validator.validate).toHaveBeenCalledWith({
        message: 'Hello World',
        status: 200,
      });
    });

    it('should preserve response properties', async () => {
      const mockResponse = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ message: 'Hello World' }),
        ok: true,
        status: 200,
        statusText: 'OK',
        body: {},
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const parseFetch = withParse(fetch);
      const response = await parseFetch('https://api.example.com/data');

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(typeof (response as any).parse).toBe('function');
    });
  });
});
