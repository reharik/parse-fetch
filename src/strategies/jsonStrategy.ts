import { jsonTypes } from '../constants';
import { ParseStrategy, KnownContentType, ParseOptions } from '../types';

export const jsonStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) =>
    jsonTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, options?: ParseOptions): Promise<T> => {
    try {
      // Use optimized fetch.json() first
      const data = await response.json();

      // If reviver is provided, re-stringify and re-parse with reviver
      if (options?.reviver) {
        return JSON.parse(JSON.stringify(data), options.reviver) as T;
      }

      return data as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
