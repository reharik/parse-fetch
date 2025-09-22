# parseFetch

A TypeScript library for parsing fetch responses with support for multiple content types and validation libraries.

## Features

- 🚀 **Strategy Pattern**: Automatically selects the right parser based on content type
- 🔧 **Library Agnostic**: Works with any validation library (Zod, Joi, Yup, etc.)
- 📦 **TypeScript First**: Full type safety with generics
- 🎯 **Comprehensive**: Supports JSON, XML, text, binary, and more content types
- ✅ **Validated**: Extensive test coverage

## Installation

```bash
npm install parse-fetch
```

## Basic Usage

```typescript
import { parseFetchResponse, withParse } from 'parse-fetch';

// Option 1: withParse higher-order function (recommended)
const parseFetch = withParse(fetch);
const data = await parseFetch('https://api.example.com/data').parse<ApiResponse>();

// Option 2: Direct function call
const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse<ApiResponse>(response);

// With options and validation
const parseFetch = withParse(fetch);
const data = await parseFetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).parse<ApiResponse>({ validator });
```

## Validation Examples

### With Zod

```typescript
import { z } from 'zod';
import { parseFetchResponse, createZodValidator } from 'parse-fetch';

const schema = z.object({
  message: z.string(),
  status: z.number(),
});

const validator = createZodValidator<z.infer<typeof schema>>(schema);

const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse(response, { validator });
// data is now fully typed and validated
```

### With Joi

```typescript
import Joi from 'joi';
import { parseFetchResponse, createJoiValidator } from 'parse-fetch';

const schema = Joi.object({
  message: Joi.string().required(),
  status: Joi.number().required(),
});

const validator = createJoiValidator<{ message: string; status: number }>(schema);

const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse(response, { validator });
```

### Custom Validator

```typescript
import { parseFetchResponse, createCustomValidator } from 'parse-fetch';

const validator = createCustomValidator<{ message: string }>((data) => {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return data as { message: string };
  }
  throw new Error('Invalid data structure');
});

const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse(response, { validator });
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


