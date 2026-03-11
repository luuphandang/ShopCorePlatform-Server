import { SetMetadata } from '@nestjs/common';

export const STATUS_TRANSITION_KEY = Symbol('STATUS_TRANSITION');

export interface IStatusTransitionMetadata {
  targetStatus: string;
  statusField?: string;
}

export const ValidateStatusTransition = (
  targetStatus: string,
  statusField: string = 'status',
): MethodDecorator => {
  return SetMetadata(STATUS_TRANSITION_KEY, { targetStatus, statusField });
};
