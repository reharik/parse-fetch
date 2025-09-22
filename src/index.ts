/**
 * Parse the body in a fetched response using Strategy pattern
 */

// Define content type arrays first
const jsonTypes = [
  'application/json',
  'application/ld+json', // JSON-LD (Linked Data) - structured data format
  'application/vnd.api+json', // JSON API - REST API specification format
] as const;

const xmlTypes = [
  'application/xml',
  'text/xml',
  'application/atom+xml', // Atom feeds - syndication format
  'application/rss+xml', // RSS feeds - Really Simple Syndication
  'application/soap+xml', // SOAP - Simple Object Access Protocol
] as const;

const textTypes = [
  'text/plain',
  'text/html',
  'text/css',
  'text/csv',
  'text/tab-separated-values', // TSV - Tab Separated Values
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'application/x-sh', // Shell scripts
  'application/x-shellscript', // Shell scripts
  'application/xhtml+xml', // XHTML - XML-based HTML
  'application/csv',
  'application/x-www-form-urlencoded', // URL-encoded form data
  'multipart/form-data', // Multipart form data (file uploads)
] as const;

const binaryTypes = [
  'application/octet-stream', // Generic binary data
  'application/pdf', // PDF documents
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml', // SVG - Scalable Vector Graphics
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/avi',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'application/zip', // ZIP archives
  'application/x-tar', // TAR archives
  'application/gzip', // GZIP compressed files
  'application/x-gzip', // Alternative GZIP MIME type
] as const;

// Additional content types that don't fit into the main categories
const additionalTypes = [
  'text/markdown', // Markdown files
  'application/yaml', // YAML files
  'text/yaml', // Alternative YAML MIME type
  'application/xml-dtd', // XML DTD files
  'text/vcard', // vCard files
  'application/vcard+json', // vCard JSON format
] as const;

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
  parse: <T>(response: Response, validator?: Validator<T>) => Promise<T>;
}


const jsonStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) => jsonTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.json();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const xmlStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) => xmlTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.text();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse XML/text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const textStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) => textTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.text();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const additionalStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) => additionalTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.text();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse additional content type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const binaryStrategy: ParseStrategy = {
  canHandle: (contentType: KnownContentType) => binaryTypes.some(type => contentType.includes(type)),
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.arrayBuffer();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse binary data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const defaultStrategy: ParseStrategy = {
  canHandle: (_contentType: string) => true, // Always handles as fallback
  parse: async <T>(response: Response, validator?: Validator<T>): Promise<T> => {
    try {
      const data = await response.text();
      return validator ? validator.validate(data) : (data as T);
    } catch (error) {
      throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

const strategies: ParseStrategy[] = [
  jsonStrategy,
  xmlStrategy,
  textStrategy,
  additionalStrategy,
  binaryStrategy,
  defaultStrategy, // Must be last as fallback
];

const getStrategy = (contentType: string): ParseStrategy => {
  // Try to find a strategy that can handle this content type
  const strategy = strategies.find(strategy => strategy.canHandle(contentType as KnownContentType));
  
  // If no strategy found, return the default strategy
  return strategy || defaultStrategy;
};

export async function parseFetchResponse<T = unknown>(
  response: Response,
  options: ParseOptions<T> = {}
): Promise<T> {
  try {
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if response has a body
    if (!response.body) {
      throw new Error('Response has no body');
    }

    const contentType = options.contentType || response.headers.get('content-type') || '';
    const strategy = getStrategy(contentType);
    
    return await strategy.parse<T>(response, options.validator);
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof Error && error.message.includes('Validation error')) {
      throw error;
    }
    
    // Wrap other errors with context
    throw new Error(`parseFetchResponse failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
