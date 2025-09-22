/**
 * Example validators for different validation libraries
 * This file demonstrates how to create validators for various libraries
 */

import { Validator } from './index.js';

// Example: Zod validator
export const createZodValidator = <T>(schema: unknown): Validator<T> => ({
  validate: (data: unknown) => (schema as { parse: (data: unknown) => T }).parse(data),
});

// Example: Joi validator
export const createJoiValidator = <T>(schema: unknown): Validator<T> => ({
  validate: (data: unknown) => {
    const { error, value } = (schema as { validate: (data: unknown) => { error?: { message: string }; value: T } }).validate(data);
    if (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
    return value;
  },
});

// Example: Yup validator (note: this returns a Promise, so use with caution)
export const createYupValidator = <T>(_schema: unknown): Validator<T> => ({
  validate: (_data: unknown) => {
    // Note: This is a simplified version. In practice, you'd need to handle the async nature
    // by either making the validator async or using a different approach
    throw new Error('Yup validator requires async handling - use a custom implementation');
  },
});

// Example: Custom validator for simple cases
export const createCustomValidator = <T>(
  validateFn: (data: unknown) => T
): Validator<T> => ({
  validate: validateFn,
});

// Example: Type guard validator
export const createTypeGuardValidator = <T>(
  typeGuard: (data: unknown) => data is T,
  errorMessage = 'Type validation failed'
): Validator<T> => ({
  validate: (data: unknown) => {
    if (typeGuard(data)) {
      return data;
    }
    throw new Error(errorMessage);
  },
});

// Example: Transform validator (useful for data transformation)
export const createTransformValidator = <T>(
  transformFn: (data: unknown) => T
): Validator<T> => ({
  validate: (data: unknown) => transformFn(data),
});
