# parse-fetch

A TypeScript library for parsing fetch responses with support for multiple content types and validation libraries.

## Features

- 🚀 **Strategy Pattern**: Automatically selects the right parser based on content type
- 🔧 **Library Agnostic**: Works with any validation library (Zod, Joi, Yup, etc.)
- 📦 **TypeScript First**: Full type safety with discriminated unions and generics
- 🎯 **Comprehensive**: Supports JSON, XML, text, binary, and more content types
- ✅ **Type-Safe Results**: Discriminated union types for perfect type safety
- 🔗 **Chainable API**: Clean chaining with `withParse` and `withParseSafe`

## Installation

```bash
npm install parse-fetch
```

## Basic Usage

```typescript
import { parseFetch, parseFetchSafe, withParse, withParseSafe } from 'parse-fetch';

// Option 1: withParse higher-order function (recommended for throwing errors)
const parseFetch = withParse(fetch);
const data = await parseFetch('https://api.example.com/data').parse<ApiResponse>();

// Option 2: Direct throwing function call
const response = await fetch('https://api.example.com/data');
const data = await parseFetch<ApiResponse>(response);

// Option 3: Safe versions that return discriminated union results
const parseFetchSafe = withParseSafe(fetch);
const result = await parseFetchSafe('https://api.example.com/data').parse<ApiResponse>();

if (result.success) {
  console.log('Data:', result.data); // TypeScript knows data exists
} else {
  console.error('Errors:', result.errors); // TypeScript knows errors exists
}

// Option 4: Direct safe function call
const response = await fetch('https://api.example.com/data');
const result = await parseFetchSafe<ApiResponse>(response);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Errors:', result.errors);
}

// With options and validation
const parseFetch = withParse(fetch);
const data = await parseFetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).parse<ApiResponse>({ validator });
```

## Type-Safe Results with Discriminated Unions

The library uses discriminated union types for perfect type safety:

```typescript
type ParseResult<T> = 
  | { success: true; data: T }      // Success case
  | { success: false; errors: string[] }; // Failure case
```

### Type Safety Benefits

```typescript
const result = await parseFetchSafe<ApiResponse>(response);

if (result.success) {
  // TypeScript knows result.data exists and is of type ApiResponse
  console.log(result.data.message); // ✅ Type-safe access
  // console.log(result.errors);    // ❌ TypeScript error - errors doesn't exist on success
} else {
  // TypeScript knows result.errors exists and is string[]
  console.log(result.errors.join(', ')); // ✅ Type-safe access
  // console.log(result.data);           // ❌ TypeScript error - data doesn't exist on failure
}
```

## Error Handling Approaches

The library provides two approaches for handling errors:

### Throwing Approach (Default)
```typescript
import { parseFetch, withParse } from 'parse-fetch';

try {
  const parseFetch = withParse(fetch);
  const data = await parseFetch('https://api.example.com/data').parse<ApiResponse>();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Result Object Approach (Safe)
```typescript
import { withParseSafe } from 'parse-fetch';

const parseFetchSafe = withParseSafe(fetch);
const result = await parseFetchSafe('https://api.example.com/data').parse<ApiResponse>();

if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Errors:', result.errors);
}
```

**Choose the approach that fits your error handling style:**
- **Throwing**: Use try/catch blocks, good for centralized error handling
- **Result objects**: Use if/else checks, good for explicit error handling and functional programming

## Validation Examples

### With Typia

```typescript
import { parseFetch, createTypiaValidator } from 'parse-fetch';
import typia from 'typia'; // Assuming Typia is installed

interface ApiResponse {
  message: string;
  status: number;
}

// Generate typia validator from TypeScript type
const typiaValidator = typia.createValidate<ApiResponse>();

const validator = createTypiaValidator<ApiResponse>(typiaValidator);

const response = await fetch('https://api.example.com/data');
const data = await parseFetch(response, { validator });
// data is now fully typed and validated by Typia
```

### Safe Typia Validator

```typescript
import { parseFetchSafe, createSafeTypiaValidator } from 'parse-fetch';
import typia from 'typia';

interface ApiResponse {
  message: string;
  status: number;
}

const typiaValidator = typia.createValidate<ApiResponse>();
const validator = createSafeTypiaValidator<ApiResponse>(typiaValidator);

const response = await fetch('https://api.example.com/data');
const result = await parseFetchSafe(response, { validator });

if (result.success) {
  console.log('Data:', result.data); // Fully typed ApiResponse
} else {
  console.error('Validation errors:', result.errors);
}
```

### With Zod

```typescript
import { z } from 'zod';
import { parseFetch, createZodValidator } from 'parse-fetch';

const schema = z.object({
  message: z.string(),
  status: z.number(),
});

const validator = createZodValidator<z.infer<typeof schema>>(schema);

const response = await fetch('https://api.example.com/data');
const data = await parseFetch(response, { validator });
// data is now fully typed and validated
```

### With Joi

```typescript
import Joi from 'joi';
import { parseFetch, createJoiValidator } from 'parse-fetch';

const schema = Joi.object({
  message: Joi.string().required(),
  status: Joi.number().required(),
});

const validator = createJoiValidator<{ message: string; status: number }>(schema);

const response = await fetch('https://api.example.com/data');
const data = await parseFetch(response, { validator });
```

### Custom Validator

```typescript
import { parseFetch, createCustomValidator } from 'parse-fetch';

const validator = createCustomValidator<{ message: string }>((data) => {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return data as { message: string };
  }
  throw new Error('Invalid data structure');
});

const response = await fetch('https://api.example.com/data');
const data = await parseFetch(response, { validator });
```

### Safe Validators (for use with Safe functions)

```typescript
import { parseFetchSafe, createSafeCustomValidator } from 'parse-fetch';

const safeValidator = createSafeCustomValidator<{ message: string }>((data) => {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return {
      success: true,
      data: data as { message: string },
    };
  }
    return {
      success: false,
      errors: ['Invalid data structure'],
    };
});

const response = await fetch('https://api.example.com/data');
const result = await parseFetchSafe(response, { validator: safeValidator });

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Errors:', result.errors);
}
```

## Chaining Approaches

### Option 1: withParse Higher-Order Function (Recommended)
```typescript
import { withParse } from 'parse-fetch';

// Create enhanced fetch
const parseFetch = withParse(fetch);

// Clean chaining syntax
const data = await parseFetch('https://api.example.com/data').parse<ApiResponse>();

// With validation
const data = await parseFetch('https://api.example.com/data').parse<ApiResponse>({ validator });

// Preserves all Response properties
const response = await parseFetch('https://api.example.com/data');
console.log(response.status); // 200
console.log(response.ok); // true
```

### Option 2: Direct Function Call
```typescript
import { parseFetchResponse } from 'parse-fetch';

// Traditional approach
const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse<ApiResponse>(response);
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

### `parseFetchResponse<T>(response, options?)`

Parses a fetch response based on its content type.

**Parameters:**
- `response: Response` - The fetch response object
- `options: ParseOptions<T>` - Optional configuration

**Returns:** `Promise<T>` - The parsed and validated data

### `ParseOptions<T>`

```typescript
interface ParseOptions<T = unknown> {
  contentType?: KnownContentType; // Override content type detection
  validator?: Validator<T>;       // Optional validator
}
```

### `Validator<T>`

```typescript
interface Validator<T> {
  validate: (data: unknown) => T;
}
```

## License

ISC


