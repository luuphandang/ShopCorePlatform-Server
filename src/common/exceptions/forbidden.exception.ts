import { GraphQLError } from 'graphql';

import { ERROR_CODES } from './constant.exception';

export class CustomForbiddenError extends GraphQLError {
  constructor(message: string = 'You do not have permission to access this resource.') {
    super(message, {
      extensions: {
        code: ERROR_CODES.FORBIDDEN,
      },
    });
  }
}
