import { GraphQLError } from 'graphql';

import { ERROR_CODES } from './constant.exception';

export class CustomUnknownError extends GraphQLError {
  constructor(message: string = 'Unknown error.') {
    super(message, {
      extensions: {
        code: ERROR_CODES.UNKNOWN_ERROR,
      },
    });
  }
}
