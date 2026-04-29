import type { TransformableInfo } from 'logform';
import { format } from 'winston';

const SERVICE_NAME = process.env.SERVICE_NAME ?? 'shopcore-server';
const SERVICE_VERSION = process.env.npm_package_version ?? process.env.SERVICE_VERSION;

export const ecsFormat = format((info) => {
  const { timestamp, level, message, requestId, userId, context, stack, ...rest } = info as Record<
    string,
    unknown
  >;

  const out: Record<string, unknown> = {
    '@timestamp': timestamp,
    'log.level': level,
    message,
    'service.name': SERVICE_NAME,
    'service.environment': process.env.NODE_ENV,
  };

  if (SERVICE_VERSION) out['service.version'] = SERVICE_VERSION;
  if (requestId !== undefined) out['trace.id'] = requestId;
  if (userId !== undefined) out['user.id'] = userId;
  if (context !== undefined) out['log.logger'] = context;
  if (stack !== undefined) out['error.stack_trace'] = stack;

  return Object.assign(out, rest) as unknown as TransformableInfo;
});
