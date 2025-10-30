/**
 * Parse the body in a fetched response using Strategy pattern
 */

import { strategies } from './strategies';
import { defaultStrategy } from './strategies/defaultStrategy';
import {
  KnownContentType,
  ParsablePromise,
  ParseOptions,
  ParseResult,
  ParseStrategy,
  SafeParsablePromise,
} from './types';

const getStrategy = (contentType: string): ParseStrategy => {
  const strategy = strategies.find(strategy =>
    strategy.canHandle(contentType as KnownContentType)
  );

  return strategy || defaultStrategy;
};

const parse = async <T = unknown>(
  response: Response,
  options: ParseOptions = {}
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
  options: ParseOptions = {}
): Promise<T> {
  const parsedResult = await parse<T>(response, options);
  if (!parsedResult.success) {
    throw new Error(parsedResult.errors.join(', '));
  }
  return parsedResult.data;
}

export async function safeParseFetch<T = unknown>(
  response: Response,
  options: ParseOptions = {}
): Promise<ParseResult<T>> {
  return parse<T>(response, options);
}

// Higher-order function that enhances fetch with parse capability
export function withParse(fetchFn: typeof fetch) {
  return function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): ParsablePromise {
    return new ParsablePromise(async (resolve, reject) => {
      try {
        const response = await fetchFn(input, init);
        const enhanced = {
          parse: <T = unknown>(options: ParseOptions = {}): Promise<T> => {
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

export function withSafeParse(fetchFn: typeof fetch) {
  return function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): SafeParsablePromise {
    return new SafeParsablePromise(async (resolve, reject) => {
      try {
        const response = await fetchFn(input, init);
        const enhanced = {
          parse: <T = unknown>(
            options: ParseOptions = {}
          ): Promise<ParseResult<T>> => {
            return safeParseFetch<T>(response, options);
          },
          // Keep original response properties
          ...response,
        };
        resolve(enhanced);
      } catch (error) {
        reject({
          success: false,
          errors: [
            `parseFetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
        });
      }
    });
  };
}
