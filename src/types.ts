import { jsonTypes, xmlTypes, textTypes, binaryTypes, additionalTypes } from "./constants";

// Combine all types into a single union
export type KnownContentType =
  | (typeof jsonTypes)[number]
  | (typeof xmlTypes)[number]
  | (typeof textTypes)[number]
  | (typeof binaryTypes)[number]
  | (typeof additionalTypes)[number];

export interface Validator<T = unknown> {
  validate: (data: unknown) => T;
}

export interface ParseOptions<T = unknown> {
  contentType?: KnownContentType;
  validator?: Validator<T>;
}

export interface ParseStrategy {
  canHandle: (contentType: KnownContentType) => boolean;
  parse: <T = unknown>(response: Response) => Promise<T>;
}

// Enhanced Response type with parse method
export type ParseableResponse = Response & {
  parse: <T = unknown>(options?: ParseOptions<T>) => Promise<T>;
};

// Custom Promise class that extends Promise and adds parse method
export class ParseablePromise extends Promise<ParseableResponse> {
  constructor(
    executor: (
      resolve: (value: ParseableResponse) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor);
  }

  parse<T = unknown>(options: ParseOptions<T> = {}): Promise<T> {
    return this.then(response => response.parse<T>(options));
  }
}
