import { GraphQLError } from 'graphql';

import { ERROR_CODES } from './constant.exception';

export class CustomUnauthorizedError extends GraphQLError {
  constructor(message: string = 'Authentication required.') {
    super(message, {
      extensions: {
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }
}
