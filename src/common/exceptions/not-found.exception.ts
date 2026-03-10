import { GraphQLError } from 'graphql';

import { ERROR_CODES } from './constant.exception';

export class CustomNotFoundError extends GraphQLError {
  constructor(message: string = 'Resource not found.') {
    super(message, {
      extensions: {
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }
}
