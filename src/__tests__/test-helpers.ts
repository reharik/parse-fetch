// Shared test utilities and types

import { expect, jest } from '@jest/globals';

// Helper function to assert ParseResult types
export function assertSuccess<T>(result: {
  success: boolean;
  data?: T;
  errors?: unknown;
}): asserts result is { success: true; data: T } {
  expect(result.success).toBe(true);
}

export function assertFailure(result: {
  success: boolean;
  data?: unknown;
  errors?: unknown;
}): asserts result is { success: false; errors: unknown } {
  expect(result.success).toBe(false);
}

export interface ApiResponse {
  message: string;
  status: number;
}

// Mock response helpers
export function createMockJsonResponse(
  data: unknown,
  ok = true,
  status = 200,
  statusText = 'OK'
) {
  return {
    headers: {
      get: jest.fn().mockReturnValue('application/json'),
    },
    json: (jest.fn() as jest.MockedFunction<any>).mockResolvedValue(data),
    ok,
    status,
    statusText,
    body: {},
  } as unknown as Response;
}

export function createMockTextResponse(
  text: string,
  contentType = 'text/plain'
) {
  return {
    headers: {
      get: jest.fn().mockReturnValue(contentType),
    },
    text: (jest.fn() as jest.MockedFunction<any>).mockResolvedValue(text),
    ok: true,
    body: {},
  } as unknown as Response;
}

export function createMockBinaryResponse(data: ArrayBuffer) {
  return {
    headers: {
      get: jest.fn().mockReturnValue('application/octet-stream'),
    },
    arrayBuffer: (jest.fn() as jest.MockedFunction<any>).mockResolvedValue(
      data
    ),
    ok: true,
    body: {},
  } as unknown as Response;
}
