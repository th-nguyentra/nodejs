export const MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  FORBIDDEN: 'You do not have permission to perform this action',
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
  TASK: {
    NOT_FOUND: 'Task not found',
    BOARD_ACCESS_DENIED: 'You do not have access to this board',
    ASSIGNEE_NOT_MEMBER: 'Assignee is not a member of this board',
    STATUS_CHANGE_FORBIDDEN: 'Only the assignee can change the task status',
  },
  INVITATION: {
    ALREADY_PENDING: 'An invitation for this email and board is already pending',
    NOT_FOUND: 'Invitation not found',
    EXPIRED: 'This invitation has expired',
    ALREADY_ACCEPTED: 'This invitation has already been accepted',
    ALREADY_MEMBER: 'User is already a member of this board',
    INVALID: 'This invitation is no longer valid',
    TOKEN_REQUIRED: 'token query parameter is required',
    EMAIL_FAILED: 'Failed to send invitation email. Please try again.',
  },
};
