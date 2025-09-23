/**
 * Example validators for different validation libraries
 * This file demonstrates how to create validators for various libraries
 */

import { ParseResult, SafeValidator, Validator } from './types';

// Example: Typia validator (throwing)
export const createTypiaValidator = <T>(validator: (input: unknown) => T): Validator<T> => ({
  validate: (data: unknown) => validator(data),
});

// Example: Safe Typia validator that returns result objects
export const createSafeTypiaValidator = <T>(validator: (input: unknown) => T): SafeValidator<T> => ({
  validate: (data: unknown): ParseResult<T> => {
    try {
      const result = validator(data);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        errors: error instanceof Error ? [error.message] : ['Typia validation failed'],
      };
    }
  },
});

// Example: Zod validator
export const createZodValidator = <T>(schema: unknown): Validator<T> => ({
  validate: (data: unknown) =>
    (schema as { parse: (data: unknown) => T }).parse(data),
});

// Example: Safe Zod validator that returns result objects
export const createSafeZodValidator = <T>(schema: unknown): SafeValidator<T> => ({
  validate: (data: unknown): ParseResult<T> => {
    try {
      const result = (schema as { parse: (data: unknown) => T }).parse(data);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        errors: error instanceof Error ? [error.message] : ['Validation failed'],
      };
    }
  },
});

// Example: Joi validator
export const createJoiValidator = <T>(schema: unknown): Validator<T> => ({
  validate: (data: unknown) => {
    const { error, value } = (
      schema as {
        validate: (data: unknown) => { error?: { message: string }; value: T };
      }
    ).validate(data);
    if (error) {
      throw new Error(`Validation error: ${error.message}`);
    }
    return value;
  },
});

// Example: Safe Joi validator that returns result objects
export const createSafeJoiValidator = <T>(schema: unknown): SafeValidator<T> => ({
  validate: (data: unknown): ParseResult<T> => {
    const { error, value } = (
      schema as {
        validate: (data: unknown) => { error?: { message: string }; value: T };
      }
    ).validate(data);
    if (error) {
      return {
        success: false,
        errors: [`Validation error: ${error.message}`],
      };
    }
    return {
      success: true,
      data: value,
    };
  },
});

// Example: Yup validator (note: this returns a Promise, so use with caution)
export const createYupValidator = <T>(_schema: unknown): Validator<T> => ({
  validate: (_data: unknown) => {
    // Note: This is a simplified version. In practice, you'd need to handle the async nature
    // by either making the validator async or using a different approach
    throw new Error(
      'Yup validator requires async handling - use a custom implementation'
    );
  },
});

// Example: Custom validator for simple cases
export const createCustomValidator = <T>(
  validateFn: (data: unknown) => T
): Validator<T> => ({
  validate: validateFn,
});

// Example: Safe custom validator for simple cases
export const createSafeCustomValidator = <T>(
  validateFn: (data: unknown) => ParseResult<T>
): SafeValidator<T> => ({
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

// Example: Safe type guard validator
export const createSafeTypeGuardValidator = <T>(
  typeGuard: (data: unknown) => data is T,
  errorMessage = 'Type validation failed'
): SafeValidator<T> => ({
  validate: (data: unknown): ParseResult<T> => {
    if (typeGuard(data)) {
      return {
        success: true,
        data,
      };
    }
    return {
      success: false,
      errors: [errorMessage],
    };
  },
});

// Example: Transform validator (useful for data transformation)
export const createTransformValidator = <T>(
  transformFn: (data: unknown) => T
): Validator<T> => ({
  validate: (data: unknown) => transformFn(data),
});

// Example: Safe transform validator
export const createSafeTransformValidator = <T>(
  transformFn: (data: unknown) => ParseResult<T>
): SafeValidator<T> => ({
  validate: transformFn,
});
