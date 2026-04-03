import { HTTP_CODE } from '@/constants';

export const HTTP_CODE_TO_STRING: Record<number, string> = Object.fromEntries(
  Object.entries(HTTP_CODE).map(([key, value]) => [value, key]),
);

/**
 * Custom application error class that extends the built-in Error.
 * Attaches an HTTP status code to each error for use in API responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  /**
   * @param message - Human-readable error description
   * @param statusCode - HTTP status code (defaults to 500)
   */
  constructor(message: string, statusCode: number = HTTP_CODE.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = HTTP_CODE_TO_STRING[statusCode] ?? 'INTERNAL_SERVER_ERROR';
  }

  // Static factory methods for common HTTP errors
  static badRequest(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.BAD_REQUEST);
  }

  static notFound(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.NOT_FOUND);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.UNAUTHORIZED);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.FORBIDDEN);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.CONFLICT);
  }

  static internal(message: string): ApiError {
    return new ApiError(message, HTTP_CODE.INTERNAL_SERVER_ERROR);
  }
}
