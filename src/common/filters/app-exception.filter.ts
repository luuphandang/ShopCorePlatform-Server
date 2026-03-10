import { BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { AbstractBase } from '../abstracts/base.abstract';
import { CoreContext } from '../contexts';
import { CustomBadRequestError } from '../exceptions/bad-request.exception';
import { CustomUnknownError } from '../exceptions/unknown.exception';

interface ValidationException extends Error {
  response: {
    message: string[];
  };
}

@Catch(Error)
export class AppExceptionFilter extends AbstractBase implements ExceptionFilter {
  constructor(coreContext: CoreContext) {
    super(coreContext);
  }

  catch(exception: Error): GraphQLError | BadRequestException | CustomUnknownError {
    if (this.isValidationException(exception)) {
      return this.handleValidationException(exception as ValidationException);
    }

    if (exception instanceof GraphQLError) {
      return this.handleGraphQLError(exception);
    }

    return this.handleUnknownError(exception);
  }

  private isValidationException(exception: Error): boolean {
    return Array.isArray((exception as ValidationException)?.response?.message);
  }

  private handleValidationException(exception: ValidationException): CustomBadRequestError {
    const message = exception.response.message.join(', ');
    this.logger.error(message, `${this.className}:handleValidationException`);
    return new CustomBadRequestError(message);
  }

  private handleGraphQLError(exception: GraphQLError): GraphQLError {
    this.logger.error(exception.message, exception.extensions?.code as string);
    return exception;
  }

  private handleUnknownError(exception: Error): CustomUnknownError {
    this.logger.error(exception.message, `${this.className}:handleUnknownError`);
    return new CustomUnknownError(exception.message);
  }
}
