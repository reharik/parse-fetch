# parse-fetch

A TypeScript library for parsing fetch responses with support for multiple content types.

## Features

- 🚀 **Strategy Pattern**: Automatically selects the right parser based on content type
- 📦 **TypeScript First**: Full type safety with discriminated unions and generics
- 🎯 **Comprehensive**: Supports JSON, XML, text, binary, and more content types
- ✅ **Type-Safe Results**: Discriminated union types for perfect type safety
- 🔗 **Chainable API**: Clean chaining with `withParse` and `withSafeParse`

## Installation

```bash
npm install parse-fetch
```

## Basic Usage

```typescript
import {
  parseFetch,
  safeParseFetch,
  withParse,
  withSafeParse,
} from 'parse-fetch';

// Option 1: withParse higher-order function (recommended for throwing errors)
const parseFetch = withParse(fetch);
const data = await parseFetch(
  'https://api.example.com/data'
).parse<ApiResponse>();

// Option 2: Direct throwing function call
const response = await fetch('https://api.example.com/data');
const data = await parseFetch<ApiResponse>(response);

// Option 3: Safe versions that return discriminated union results
const parseFetchSafe = withSafeParse(fetch);
const result = await parseFetchSafe(
  'https://api.example.com/data'
).parse<ApiResponse>();

if (result.success) {
  console.log('Data:', result.data);
} else {
  // result.errors is BaseApiError[]
  console.error('Errors:', result.errors.map(e => e.message).join(', '));
}

// Option 4: Direct safe function call
const response = await fetch('https://api.example.com/data');
const result = await safeParseFetch<ApiResponse>(response);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Errors:', result.errors.map(e => e.message).join(', '));
}

// With options
const parseFetch = withParse(fetch);
const data = await parseFetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
}).parse<ApiResponse>();
```

## Type-Safe Results with Discriminated Unions

The library uses discriminated union types for perfect type safety:

```typescript
type BaseApiError =
  | { kind: 'parse' | 'network'; message: string; originalError?: unknown }
  | {
      kind: 'http';
      message: string;
      status: number;
      statusText: string;
      bodyText?: string;
    };

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: BaseApiError[] };
```

### Type Safety Benefits

```typescript
const result = await safeParseFetch<ApiResponse>(response);

if (result.success) {
  // TypeScript knows result.data exists and is of type ApiResponse
  console.log(result.data.message); // ✅ Type-safe access
  // console.log(result.errors);    // ❌ TypeScript error - errors doesn't exist on success
} else {
  // TypeScript knows result.errors exists and is BaseApiError[]
  for (const err of result.errors) {
    if (err.kind === 'http') {
      console.error(`[HTTP ${err.status} ${err.statusText}] ${err.message}`);
    } else {
      console.error(err.message);
    }
  }
  // console.log(result.data); // ❌ data doesn't exist on failure
}
```

## Error Handling Approaches

The library provides two approaches for handling errors:

### Throwing Approach (Default)

```typescript
import { parseFetch, withParse } from 'parse-fetch';

try {
  const parseFetch = withParse(fetch);
  const data = await parseFetch(
    'https://api.example.com/data'
  ).parse<ApiResponse>();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Result Object Approach (Safe)

```typescript
import { withSafeParse } from 'parse-fetch';

const parseFetchSafe = withSafeParse(fetch);
const result = await parseFetchSafe(
  'https://api.example.com/data'
).parse<ApiResponse>();

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Errors:', result.errors.map(e => e.message).join(', '));
}
```

**Choose the approach that fits your error handling style:**

- **Throwing**: Use try/catch blocks, good for centralized error handling
- **Result objects**: Use if/else checks, good for explicit error handling and functional programming

## Chaining Approaches

### Option 1: withParse Higher-Order Function (Recommended)

```typescript
import { withParse } from 'parse-fetch';

// Create enhanced fetch
const parseFetch = withParse(fetch);

// Clean chaining syntax
const data = await parseFetch(
  'https://api.example.com/data'
).parse<ApiResponse>();

// Preserves all Response properties
const response = await parseFetch('https://api.example.com/data');
console.log(response.status); // 200
console.log(response.ok); // true
```

### Option 2: Direct Function Call

```typescript
import { parseFetch } from 'parse-fetch';

// Traditional approach
const response = await fetch('https://api.example.com/data');
const data = await parseFetch<ApiResponse>(response);
```

## Supported Content Types

### JSON

- `application/json`
- `application/ld+json` (JSON-LD)
- `application/vnd.api+json` (JSON API)

### XML

- `application/xml`
- `text/xml`
- `application/atom+xml` (Atom feeds)
- `application/rss+xml` (RSS feeds)
- `application/soap+xml` (SOAP)

### Text

- `text/plain`
- `text/html`
- `text/css`
- `text/csv`
- `text/javascript`
- `application/javascript`
- `application/x-www-form-urlencoded`
- `multipart/form-data`

### Binary

- `application/octet-stream`
- `application/pdf`
- `image/*` (PNG, JPEG, GIF, SVG, WebP)
- `video/*` (MP4, WebM, AVI)
- `audio/*` (MP3, WAV, OGG)
- `application/zip`
- `application/x-tar`
- `application/gzip`

## API Reference

### `parseFetch<T>(response, options?)`

Parses a fetch response based on its content type.

**Parameters:**

- `response: Response` - The fetch response object
- `options: ParseOptions` - Optional configuration

**Returns:** `Promise<T>` - The parsed data

### `ParseOptions`

```typescript
interface ParseOptions {
  contentType?: KnownContentType; // Override content type detection
  reviver?: (key: string, value: any) => any; // JSON reviver
}
```

### `safeParseFetch<T>(response, options?)`

Returns a discriminated union `ParseResult<T>` where failures contain structured errors:

```typescript
type BaseApiError =
  | { kind: 'parse' | 'network'; message: string; originalError?: unknown }
  | {
      kind: 'http';
      message: string;
      status: number;
      statusText: string;
      bodyText?: string;
    };

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: BaseApiError[] };
```

## License

ISC
