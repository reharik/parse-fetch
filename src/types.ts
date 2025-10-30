import {
  jsonTypes,
  xmlTypes,
  textTypes,
  binaryTypes,
  additionalTypes,
} from './constants';

// Combine all types into a single union
export type KnownContentType =
  | (typeof jsonTypes)[number]
  | (typeof xmlTypes)[number]
  | (typeof textTypes)[number]
  | (typeof binaryTypes)[number]
  | (typeof additionalTypes)[number];

export interface ParseOptions {
  contentType?: KnownContentType;
  reviver?: (key: string, value: any) => any;
}

export interface SuccessResult<T = unknown> {
  success: true;
  data: T;
}

export interface FailureResult {
  success: false;
  errors: string[];
}

export type ParseResult<T = unknown> = SuccessResult<T> | FailureResult;

export function isParseResult<T>(value: unknown): value is ParseResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as any).success === 'boolean'
  );
}

export interface ParseStrategy {
  canHandle: (contentType: KnownContentType) => boolean;
  parse: <T = unknown>(response: Response, options: ParseOptions) => Promise<T>;
}

// Enhanced Response type with parse method
export type ParsableResponse = Response & {
  parse: <T = unknown>(options?: ParseOptions) => Promise<T>;
};

// Custom Promise class that extends Promise and adds parse method
export class ParsablePromise extends Promise<ParsableResponse> {
  constructor(
    executor: (
      resolve: (value: ParsableResponse) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor);
  }

  parse<T = unknown>(options: ParseOptions = {}): Promise<T> {
    return this.then(response => response.parse<T>(options));
  }
}

// Enhanced Response type with parse method
export type SafeParsableResponse = Response & {
  parse: <T = unknown>(options?: ParseOptions) => Promise<ParseResult<T>>;
};

// Custom Promise class that extends Promise and adds parse method
export class SafeParsablePromise extends Promise<SafeParsableResponse> {
  constructor(
    executor: (
      resolve: (value: SafeParsableResponse) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor);
  }

  parse<T = unknown>(options: ParseOptions = {}): Promise<ParseResult<T>> {
    return this.then(response => response.parse<T>(options));
  }
}
