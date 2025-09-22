import { additionalTypes } from '../constants';
import { ParseStrategy, KnownContentType } from '../types';

export const additionalStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) =>
    additionalTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response): Promise<T> => {
    try {
      return await response.text() as T;
    } catch (error) {
      throw new Error(
        `Failed to parse additional content type: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
