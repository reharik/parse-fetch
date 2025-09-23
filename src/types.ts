import { jsonTypes, xmlTypes, textTypes, binaryTypes, additionalTypes } from "./constants";

// Combine all types into a single union
export type KnownContentType =
  | (typeof jsonTypes)[number]
  | (typeof xmlTypes)[number]
  | (typeof textTypes)[number]
  | (typeof binaryTypes)[number]
  | (typeof additionalTypes)[number];

export interface ThrowingValidator<T = unknown> {
  validate: (data: unknown) => T;
}

export interface SafeValidator<T = unknown> {
  validate: (data: unknown) => ParseResult<T>;
}

export type Validator<T = unknown> = ThrowingValidator<T> | SafeValidator<T>;


export interface ParseOptions<T = unknown> {
  contentType?: KnownContentType;
  validator?: Validator<T>;
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

// Helper function to handle validation results with better type inference
export function handleValidationResult<T>(
  result: T | ParseResult<T>
): ParseResult<T> {
  if (isParseResult(result)) {
    return result;
  }
  return { success: true, data: result };
}

export interface ParseStrategy {
  canHandle: (contentType: KnownContentType) => boolean;
  parse: <T = unknown>(response: Response, options: ParseOptions<T>) => Promise<T>;
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

// Enhanced Response type with parse method
export type SafeParseableResponse = Response & {
    parse: <T = unknown>(options?: ParseOptions<T>) => Promise<ParseResult<T>>;
  };
  
  // Custom Promise class that extends Promise and adds parse method
  export class SafeParseablePromise extends Promise<SafeParseableResponse> {
    constructor(
      executor: (
        resolve: (value: SafeParseableResponse) => void,
        reject: (reason?: any) => void
      ) => void
    ) {
      super(executor);
    }
  
    parse<T = unknown>(options: ParseOptions<T> = {}): Promise<ParseResult<T>> {
      return this.then(response => response.parse<T>(options));
    }
  }
  