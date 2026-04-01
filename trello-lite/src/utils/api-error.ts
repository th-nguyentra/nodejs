import { HTTP_CODE } from '@/constants';

/**
 * Custom application error class that extends the built-in Error.
 * Attaches an HTTP status code to each error for use in API responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  /**
   * @param message - Human-readable error description
   * @param statusCode - HTTP status code (defaults to 500)
   */
  constructor(message: string, statusCode: number = HTTP_CODE.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
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
