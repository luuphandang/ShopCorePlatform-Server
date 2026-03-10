import { GraphQLError } from 'graphql';

import { ERROR_CODES } from './constant.exception';

export class CustomBadRequestError extends GraphQLError {
  constructor(message: string = 'Invalid request.') {
    super(message, {
      extensions: {
        code: ERROR_CODES.BAD_REQUEST,
      },
    });
  }
}
