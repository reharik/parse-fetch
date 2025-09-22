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
npm install parsefetch
```

## Basic Usage

```typescript
import { parseFetchResponse } from 'parsefetch';

// Basic usage
const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse<ApiResponse>(response);

// With content type override
const data = await parseFetchResponse<ApiResponse>(response, {
  contentType: 'application/json'
});
```

## Validation Examples

### With Zod

```typescript
import { z } from 'zod';
import { parseFetchResponse, createZodValidator } from 'parsefetch';

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
import { parseFetchResponse, createJoiValidator } from 'parsefetch';

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
import { parseFetchResponse, createCustomValidator } from 'parsefetch';

const validator = createCustomValidator<{ message: string }>((data) => {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return data as { message: string };
  }
  throw new Error('Invalid data structure');
});

const response = await fetch('https://api.example.com/data');
const data = await parseFetchResponse(response, { validator });
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


