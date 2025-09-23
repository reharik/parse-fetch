import { xmlTypes } from '../constants';
import { ParseStrategy, KnownContentType, ParseOptions } from '../types';

export const xmlStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) =>
    xmlTypes.some(type => contentType.includes(type)),
  parse: async <T>(
    response: Response,
    _options?: ParseOptions<T>
  ): Promise<T> => {
    try {
      return (await response.text()) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse XML/text: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
