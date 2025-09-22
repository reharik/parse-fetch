/**
 * Parse the body in a fetched response using Strategy pattern
 */

import { strategies } from './strategies';
import { defaultStrategy } from './strategies/defaultStrategy';
import {
  KnownContentType,
  ParseablePromise,
  ParseOptions,
  ParseStrategy,
} from './types';

const getStrategy = (contentType: string): ParseStrategy => {
  const strategy = strategies.find(strategy =>
    strategy.canHandle(contentType as KnownContentType)
  );

  return strategy || defaultStrategy;
};

export async function parseFetchResponse<T = unknown>(
  response: Response,
  options: ParseOptions<T> = {}
): Promise<T> {
  try {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response has no body');
    }

    const contentType =
      options.contentType || response.headers.get('content-type') || '';
    const strategy = getStrategy(contentType);

    // Parse the response
    const parsedData = await strategy.parse<T>(response, options);

    // Apply validation if provided
    if (options.validator) {
      return options.validator.validate(parsedData);
    }

    // Return as-is if no validator
    return parsedData;
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof Error && error.message.includes('Validation error')) {
      throw error;
    }

    // Wrap other errors with context
    throw new Error(
      `parseFetchResponse failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
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
            return parseFetchResponse<T>(response, options);
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
