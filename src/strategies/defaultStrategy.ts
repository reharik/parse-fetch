import { ParseStrategy } from '../types';

export const defaultStrategy: ParseStrategy = {
  canHandle: (_contentType: string) => true, // Always handles as fallback
  parse: async <T>(response: Response): Promise<T> => {
    try {
      return await response.text() as T;
    } catch (error) {
      throw new Error(
        `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
