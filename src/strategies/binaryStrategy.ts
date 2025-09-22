import { binaryTypes } from '../constants';
import { ParseStrategy, KnownContentType } from '../types';

export const binaryStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) =>
    binaryTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response): Promise<T> => {
    try {
      return await response.arrayBuffer() as T;
    } catch (error) {
      throw new Error(
        `Failed to parse binary data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
