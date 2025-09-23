/**
 * Parse the body in a fetched response using Strategy pattern
 */

import { strategies } from './strategies';
import { defaultStrategy } from './strategies/defaultStrategy';
import {
  handleValidationResult,
  KnownContentType,
  ParseablePromise,
  ParseOptions,
  ParseResult,
  ParseStrategy,
  SafeParseablePromise,
} from './types';

const getStrategy = (contentType: string): ParseStrategy => {
  const strategy = strategies.find(strategy =>
    strategy.canHandle(contentType as KnownContentType)
  );

  return strategy || defaultStrategy;
};

const parse = async <T = unknown>(
  response: Response,
  options: ParseOptions<T> = {}
): Promise<ParseResult<T>> => {
  try {
    if (!response.ok) {
      return {
        success: false,
        errors: [
          `ParseFetch Error:HTTP ${response.status}: ${response.statusText}`,
        ],
      };
    }

    if (!response.body) {
      return {
        success: false,
        errors: ['ParseFetch Error:Response has no body'],
      };
    }

    const contentType =
      options.contentType || response.headers.get('content-type') || '';
    const strategy = getStrategy(contentType);

    // Parse the response
    const parsedData = await strategy.parse<T>(response, options);
    return { success: true, data: parsedData };
  } catch (error) {
    // Wrap other errors with context
    return {
      success: false,
      errors: [
        `parseFetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
};

export async function parseFetch<T = unknown>(
  response: Response,
  options: ParseOptions<T> = {}
): Promise<T> {
  const parsedResult = await parse<T>(response, options);
  if (!parsedResult.success) {
    throw new Error(parsedResult.errors.join(', '));
  }

  if (!options.validator) {
    return parsedResult.data;
  }

  const validationResult = options.validator.validate(parsedResult.data);
  const handledResult = handleValidationResult(validationResult);
  
  if (!handledResult.success) {
    throw new Error(handledResult.errors.join(', '));
  }
  
  return handledResult.data;
}

export async function parseFetchSafe<T = unknown>(
  response: Response,
  options: ParseOptions<T> = {}
): Promise<ParseResult<T>> {
  const parsedResult = await parse<T>(response, options);
  if (!parsedResult.success || !options.validator) {
    return parsedResult;
  }

  const validationResult = options.validator.validate(parsedResult.data);
  return handleValidationResult(validationResult);
}

// Higher-order function that enhances fetch with parse capability
export function withParse(fetchFn: typeof fetch) {
  return function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): ParseablePromise {
    return new ParseablePromise(async (resolve, reject) => {
      try {
        const response = await fetchFn(input, init);
        const enhanced = {
          parse: <T = unknown>(options: ParseOptions<T> = {}): Promise<T> => {
            return parseFetch<T>(response, options);
          },
          // Keep original response properties
          ...response,
        };
        resolve(enhanced);
      } catch (error) {
        reject(error);
      }
    });
  };
}

export function withParseSafe(fetchFn: typeof fetch) {
  return function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): SafeParseablePromise {
    return new SafeParseablePromise(async (resolve, reject) => {
      try {
        const response = await fetchFn(input, init);
        const enhanced = {
          parse: <T = unknown>(
            options: ParseOptions<T> = {}
          ): Promise<ParseResult<T>> => {
            return parseFetchSafe<T>(response, options);
          },
          // Keep original response properties
          ...response,
        };
        resolve(enhanced);
      } catch (error) {
        reject(error);
      }
    });
  };
}