import { jsonTypes } from '../constants';
import { ParseStrategy, KnownContentType } from '../types';

export const jsonStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) =>
    jsonTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response): Promise<T> => {
    try {
      return await response.json() as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
