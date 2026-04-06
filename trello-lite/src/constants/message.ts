export const MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  VALIDATION_FAILED: 'The provided data is invalid.',
  EMPTY_BODY: 'Request body is required',

  AUTH: {
    USER_ALREADY_EXISTS: 'Email or username already exists',
    USER_NOT_FOUND: 'User not found. Please register first.',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    USERNAME_REQUIRED: 'Username is required',
    USERNAME_TOO_SHORT: 'Username must be at least 3 characters long',
    USERNAME_TOO_LONG: 'Username must be at most 30 characters long',
    MISSING_TOKEN: 'Authorization token is required',
    INVALID_TOKEN: 'Invalid or expired token',
  },
  BOARD: {
    NOT_FOUND: 'Board not found',
  },
};
